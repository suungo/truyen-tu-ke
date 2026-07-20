export type VideoJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface VideoJob {
  id: string;
  title: string;
  script: string;
  status: VideoJobStatus;
  progress: number; // 0-100
  videoPath?: string; // absolute path on disk
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

/** In-memory job store (không cần DB, sẽ mất khi Render restart — acceptable) */
export class VideoJobStore {
  private readonly jobs = new Map<string, VideoJob>();

  create(id: string, title: string, script: string): VideoJob {
    const job: VideoJob = {
      id,
      title,
      script,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
    };
    this.jobs.set(id, job);
    return job;
  }

  get(id: string): VideoJob | undefined {
    return this.jobs.get(id);
  }

  update(id: string, patch: Partial<VideoJob>): VideoJob | undefined {
    const job = this.jobs.get(id);
    if (!job) return undefined;
    Object.assign(job, patch);
    this.jobs.set(id, job);
    return job;
  }

  list(): VideoJob[] {
    return Array.from(this.jobs.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  delete(id: string): void {
    this.jobs.delete(id);
  }
}
