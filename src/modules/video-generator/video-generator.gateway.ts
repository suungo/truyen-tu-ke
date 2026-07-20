import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'video-generator',
})
export class VideoGeneratorGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(VideoGeneratorGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`[VideoGenerator] Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`[VideoGenerator] Client disconnected: ${client.id}`);
  }

  emitProgress(jobId: string, progress: number, message: string) {
    this.server.emit('video:progress', { jobId, progress, message });
  }

  emitCompleted(jobId: string, downloadUrl: string, title: string) {
    this.server.emit('video:completed', { jobId, downloadUrl, title });
    this.logger.log(`[VideoGenerator] Job ${jobId} completed → ${downloadUrl}`);
  }

  emitFailed(jobId: string, error: string, title: string) {
    this.server.emit('video:failed', { jobId, error, title });
    this.logger.error(`[VideoGenerator] Job ${jobId} failed: ${error}`);
  }
}
