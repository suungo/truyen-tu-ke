import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  handleConnection(client: Socket) {
    const readerId = client.handshake.query.readerId;
    if (readerId) {
      const roomName = `reader_${readerId}`;
      client.join(roomName);
      this.logger.log(
        `Reader ${readerId} connected and joined room ${roomName} (Socket ID: ${client.id})`,
      );
    } else {
      this.logger.log(`Anonymous client connected (Socket ID: ${client.id})`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected (Socket ID: ${client.id})`);
  }

  /**
   * Send a real-time notification to a specific reader's room.
   */
  sendToReader(readerId: number, notification: any) {
    const roomName = `reader_${readerId}`;
    this.server.to(roomName).emit('notification', notification);
    this.logger.log(`Emitted notification to room ${roomName}`);
  }

  /**
   * Broadcast a notification to all connected clients.
   */
  broadcast(notification: any) {
    this.server.emit('notification', notification);
    this.logger.log(`Broadcasted notification to all connected clients`);
  }
}
