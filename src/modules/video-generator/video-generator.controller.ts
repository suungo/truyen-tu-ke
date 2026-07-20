import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import { VideoGeneratorService } from './video-generator.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { BaseResponse } from 'src/common/responses/base-response';

@Controller('video-generator')
export class VideoGeneratorController {
  constructor(private readonly videoService: VideoGeneratorService) {}

  /**
   * POST /api/v1/video-generator/generate
   * Nhận kịch bản, tạo job và xử lý ngầm. Trả về ngay lập tức.
   */
  @Post('generate')
  @HttpCode(HttpStatus.ACCEPTED)
  async generate(@Body() dto: CreateVideoDto) {
    const job = await this.videoService.createJob(dto);
    return new BaseResponse(202, 'Đang xử lý video, vui lòng chờ...', {
      jobId: job.id,
      status: job.status,
    });
  }

  /**
   * GET /api/v1/video-generator/jobs
   * Lấy danh sách tất cả jobs
   */
  @Get('jobs')
  getJobs() {
    return new BaseResponse(200, 'Danh sách jobs', this.videoService.listJobs());
  }

  /**
   * GET /api/v1/video-generator/jobs/:id
   * Lấy trạng thái 1 job
   */
  @Get('jobs/:id')
  getJob(@Param('id') id: string) {
    const job = this.videoService.getJob(id);
    return new BaseResponse(200, 'Chi tiết job', job);
  }

  /**
   * GET /api/v1/video-generator/download/:id
   * Stream video MP4 về client
   */
  @Get('download/:id')
  async download(@Param('id') id: string, @Res() res: Response) {
    const videoPath = this.videoService.getVideoPath(id);
    const stat = fs.statSync(videoPath);
    const job = this.videoService.getJob(id);

    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(job.title)}.mp4"`,
    );
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Cache-Control', 'no-store');

    const stream = fs.createReadStream(videoPath);
    stream.pipe(res);
    stream.on('error', () => res.status(500).end());
  }

  /**
   * DELETE /api/v1/video-generator/jobs/:id
   * Xóa job và file video tạm
   */
  @Delete('jobs/:id')
  deleteJob(@Param('id') id: string) {
    this.videoService.deleteJob(id);
    return new BaseResponse(200, 'Đã xóa job', null);
  }
}
