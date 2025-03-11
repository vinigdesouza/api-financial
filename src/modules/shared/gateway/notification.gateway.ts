import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } }) // Permite conexões externas
export class NotificationGateway {
  @WebSocketServer()
  server: Server;

  sendNotification(event: string, data: any) {
    this.server.emit(event, data);
  }
}
