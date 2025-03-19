import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { StreamService } from './stream.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

dotenv.config();

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class StreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private activeStreams = new Map<number, string[]>();

  constructor(private readonly streamService: StreamService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) {
        throw new ForbiddenException('Token is required');
      }

      const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY) as {
        id: number;
        username: string;
      };

      console.log(`User connected: ${payload.username}`);
      client.data.user = payload;
    } catch (error) {
      console.error('Connection error:', error.message);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    console.log(`User disconnected: ${client.id}`);

    this.activeStreams.forEach((clients, streamerId) => {
      const updatedClients = clients.filter((id) => id !== client.id);
      if (updatedClients.length === 0) {
        this.activeStreams.delete(streamerId);
      } else {
        this.activeStreams.set(streamerId, updatedClients);
      }
    });
  }

  @SubscribeMessage('startStream')
  async handleStartStream(
    client: Socket,
    @MessageBody() { streamerId }: { streamerId: number },
  ) {
    try {
      const user = client.data.user;
      if (!user || user.id !== streamerId) {
        throw new ForbiddenException('Unauthorized to start stream');
      }

      const activeStream = await this.streamService.getActiveStream(
        streamerId,
        streamerId,
        true,
      );

      if (activeStream) {
        throw new BadRequestException('You already have an active stream.');
      }

      const newStream = await this.streamService.createStream(streamerId);

      if (!this.activeStreams.has(streamerId)) {
        this.activeStreams.set(streamerId, []);
      }
      this.activeStreams.get(streamerId)?.push(client.id);

      this.server.emit('streamStarted', {
        streamId: newStream.id,
        streamerId: newStream.streamer_id,
      });

      return { message: 'Stream started successfully.' };
    } catch (error) {
      console.error('Error starting stream:', error);
      client.emit('error', error.message || 'Server error');
    }
  }

  @SubscribeMessage('joinStream')
  async joinStream(
    client: Socket,
    @MessageBody() { streamId, userId }: { streamId: number; userId: number },
  ) {
    try {
      const stream = await this.streamService.getStreamById(streamId, userId);
      if (!this.activeStreams.has(streamId)) {
        this.activeStreams.set(streamId, []);
      }

      this.activeStreams.get(streamId)?.push(client.id);
      client.join(`stream-${streamId}`);
      client.emit('joinedStream', { streamId });

      console.log(`User ${userId} joined stream ${streamId}`);
    } catch (error) {
      client.emit('error', 'Access denied or stream not found');
    }
  }

  @SubscribeMessage('sendMessage')
  async sendMessage(
    client: Socket,
    @MessageBody()
    { streamId, message }: { streamId: number; message: string },
  ) {
    const viewers = this.activeStreams.get(streamId) || [];
    if (!viewers.includes(client.id)) {
      throw new ForbiddenException('You are not in this stream');
    }

    this.server.to(`stream-${streamId}`).emit('newMessage', {
      userId: client.data.user.id,
      message,
      timestamp: new Date(),
    });

    console.log(`Message in stream ${streamId}: ${message}`);
  }

  @SubscribeMessage('endStream')
  async endStream(
    client: Socket,
    @MessageBody()
    { streamerId }: { streamerId: number },
  ) {
    try {
      const user = client.data.user;
      if (!user || user.id !== streamerId) {
        throw new ForbiddenException('Unauthorized to end stream');
      }

      await this.streamService.endStream(streamerId, user.id);
      const streamId = Array.from(this.activeStreams.keys()).find(
        (id) => id === streamerId,
      );
      if (streamId) {
        this.server.to(`stream-${streamId}`).emit('streamEnded', { streamId });
        this.activeStreams.delete(streamId);
      }
      console.log(`Stream ended: ${streamId}`);
    } catch (error) {
      client.emit('error', 'Cannot end this stream');
    }
  }

  @SubscribeMessage('requestToJoin')
  async requestToJoin(
    client: Socket,
    @MessageBody() { streamId }: { streamId: number },
  ) {
    const viewers = this.activeStreams.get(streamId) || [];
    if (!viewers.includes(client.id)) {
      throw new ForbiddenException('You are not in this stream');
    }

    this.server.to(`stream-${streamId}`).emit('joinRequest', {
      userId: client.data.user.id,
    });
    console.log(
      `User ${client.data.user.id} requested to join stream ${streamId}`,
    );
  }

  @SubscribeMessage('acceptJoinRequest')
  async acceptJoinRequest(
    client: Socket,
    @MessageBody() { streamId, userId }: { streamId: number; userId: number },
  ) {
    const user = client.data.user;
    if (!user) {
      throw new ForbiddenException('Unauthorized');
    }

    this.server.to(`stream-${streamId}`).emit('requestAccepted', { userId });
    console.log(`User ${userId} accepted to stream ${streamId}`);
  }
}
