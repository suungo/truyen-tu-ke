import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { CreateVideoDto } from './dto/create-video.dto';
import { VideoJobStore, VideoJob } from './video-job.store';
import { VideoGeneratorGateway } from './video-generator.gateway';

// Dynamic imports để tránh lỗi nếu chưa cài package
let MsEdgeTTS: any;
let OUTPUT_FORMAT: any;
let ffmpeg: any;
let ffmpegInstaller: any;

@Injectable()
export class VideoGeneratorService {
  private readonly logger = new Logger(VideoGeneratorService.name);
  private readonly store = new VideoJobStore();

  constructor(private readonly gateway: VideoGeneratorGateway) {
    this.loadDependencies();
  }

  private async loadDependencies() {
    try {
      const edgeTts = await import('msedge-tts');
      MsEdgeTTS = edgeTts.MsEdgeTTS;
      OUTPUT_FORMAT = edgeTts.OUTPUT_FORMAT;
    } catch {
      this.logger.warn('msedge-tts not installed. Run: npm install msedge-tts');
    }
    try {
      const fluentFfmpeg = await import('fluent-ffmpeg');
      ffmpeg = fluentFfmpeg.default || fluentFfmpeg;
      ffmpegInstaller = await import('@ffmpeg-installer/ffmpeg');
      ffmpeg.setFfmpegPath(ffmpegInstaller.path);
      this.logger.log(`FFmpeg ready: ${ffmpegInstaller.path}`);
    } catch {
      this.logger.warn(
        'fluent-ffmpeg or @ffmpeg-installer/ffmpeg not installed. Run: npm install fluent-ffmpeg @ffmpeg-installer/ffmpeg',
      );
    }
  }

  /** Tạo job mới và chạy pipeline ngầm */
  async createJob(dto: CreateVideoDto): Promise<VideoJob> {
    const jobId = randomUUID();
    const job = this.store.create(jobId, dto.title, dto.script);

    // Chạy pipeline ngầm, không await để trả về ngay
    this.runPipeline(jobId, dto).catch((err) => {
      this.logger.error(`Pipeline error for job ${jobId}:`, err);
    });

    return job;
  }

  listJobs(): VideoJob[] {
    return this.store.list();
  }

  getJob(id: string): VideoJob {
    const job = this.store.get(id);
    if (!job) throw new NotFoundException(`Job ${id} không tồn tại`);
    return job;
  }

  getVideoPath(id: string): string {
    const job = this.store.get(id);
    if (!job) throw new NotFoundException(`Job ${id} không tồn tại`);
    if (job.status !== 'completed' || !job.videoPath) {
      throw new NotFoundException(`Video chưa hoàn thành`);
    }
    if (!fs.existsSync(job.videoPath)) {
      throw new NotFoundException(`File video không còn tồn tại (server đã restart)`);
    }
    return job.videoPath;
  }

  deleteJob(id: string): void {
    const job = this.store.get(id);
    if (job?.videoPath && fs.existsSync(job.videoPath)) {
      fs.unlinkSync(job.videoPath);
    }
    this.store.delete(id);
  }

  // ─── Private Pipeline ─────────────────────────────────────────────────────

  private async runPipeline(jobId: string, dto: CreateVideoDto): Promise<void> {
    const tmpDir = os.tmpdir();
    const audioPath = path.join(tmpDir, `${jobId}.mp3`);
    const videoPath = path.join(tmpDir, `${jobId}.mp4`);

    this.store.update(jobId, { status: 'processing', progress: 5 });
    this.gateway.emitProgress(jobId, 5, 'Đang khởi tạo...');

    try {
      // ── Bước 1: Text-to-Speech ─────────────────────────────────────────────
      await this.generateAudio(jobId, dto, audioPath);

      // ── Bước 2: FFmpeg render video ─────────────────────────────────────────
      await this.renderVideo(jobId, dto, audioPath, videoPath);

      // ── Bước 3: Dọn dẹp audio tạm ────────────────────────────────────────────
      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);

      this.store.update(jobId, {
        status: 'completed',
        progress: 100,
        videoPath,
        completedAt: new Date(),
      });

      this.gateway.emitCompleted(
        jobId,
        `/api/v1/video-generator/download/${jobId}`,
        dto.title,
      );
    } catch (err: any) {
      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
      if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);

      const errMsg = err?.message || String(err);
      this.store.update(jobId, { status: 'failed', error: errMsg });
      this.gateway.emitFailed(jobId, errMsg, dto.title);
      throw err;
    }
  }

  private async generateAudio(
    jobId: string,
    dto: CreateVideoDto,
    audioPath: string,
  ): Promise<void> {
    this.gateway.emitProgress(jobId, 15, 'Đang tạo giọng đọc...');

    if (!MsEdgeTTS) {
      throw new Error('msedge-tts chưa được cài đặt. Chạy: npm install msedge-tts');
    }

    const voice = dto.voice || 'vi-VN-NamMinhNeural';
    const rate = dto.rate || '+0%';

    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    const { audioStream } = tts.toStream(dto.script, { rate });

    await new Promise<void>((resolve, reject) => {
      const writeStream = fs.createWriteStream(audioPath);
      audioStream.pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      audioStream.on('error', reject);
    });

    this.store.update(jobId, { progress: 45 });
    this.gateway.emitProgress(jobId, 45, 'Giọng đọc hoàn thành, đang dựng video...');
  }

  private async renderVideo(
    jobId: string,
    dto: CreateVideoDto,
    audioPath: string,
    videoPath: string,
  ): Promise<void> {
    if (!ffmpeg) {
      throw new Error(
        'fluent-ffmpeg chưa được cài đặt. Chạy: npm install fluent-ffmpeg @ffmpeg-installer/ffmpeg',
      );
    }

    // Tạo text an toàn cho FFmpeg drawtext
    const safeTitle = dto.title
      .replace(/[':]/g, ' ')
      .replace(/\\/g, '/')
      .substring(0, 80);

    const safeScript = dto.script
      .replace(/[':]/g, ' ')
      .replace(/\\/g, '/')
      .replace(/\n+/g, ' | ')
      .substring(0, 200);

    // Màu nền gradient: dùng lavfi color + overlay gradient effect
    const gradFrom = '1a1a2e';  // deep navy
    const gradTo = '16213e';    // dark blue

    const drawtextTitle = [
      `fontcolor=white`,
      `fontsize=40`,
      `x=(w-text_w)/2`,
      `y=h*0.25`,
      `text='${safeTitle}'`,
      `shadowcolor=black@0.8`,
      `shadowx=2`,
      `shadowy=2`,
    ].join(':');

    const drawtextScript = [
      `fontcolor=0xe0e0e0`,
      `fontsize=22`,
      `x=60`,
      `y=h*0.45`,
      `text='${safeScript}'`,
      `line_spacing=8`,
      `shadowcolor=black@0.5`,
      `shadowx=1`,
      `shadowy=1`,
    ].join(':');

    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(`color=c=0x${gradFrom}:s=1280x720:r=25`)
        .inputOptions(['-f', 'lavfi'])
        .input(audioPath)
        .complexFilter([
          // Gradient overlay từ navyblue sang darkblue
          `[0:v]split=1[base]`,
          `[base]drawbox=x=0:y=0:w=iw:h=ih:color=0x${gradTo}@0.4:t=fill[bg]`,
          // Accent line trang trí bên trái
          `[bg]drawbox=x=20:y=80:w=4:h=560:color=0xa78bfa@0.8:t=fill[bg2]`,
          // Title text
          `[bg2]drawtext=${drawtextTitle}[bg3]`,
          // Script text (multi-line workaround: dùng subtitle nếu dài)
          `[bg3]drawtext=${drawtextScript}[out]`,
        ])
        .outputOptions([
          '-map', '[out]',
          '-map', '1:a',
          '-c:v', 'libx264',
          '-preset', 'ultrafast',
          '-crf', '28',
          '-pix_fmt', 'yuv420p',
          '-c:a', 'aac',
          '-b:a', '128k',
          '-shortest',
          '-movflags', '+faststart',
        ])
        .save(videoPath)
        .on('progress', (progress: any) => {
          const p = Math.min(95, 45 + Math.round((progress.percent || 0) * 0.5));
          this.store.update(jobId, { progress: p });
          this.gateway.emitProgress(jobId, p, 'Đang render video...');
        })
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(err));
    });
  }
}
