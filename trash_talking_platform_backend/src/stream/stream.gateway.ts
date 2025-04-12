import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import {
  Injectable,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { User } from '../user/models/user.model';
import { InjectModel } from '@nestjs/sequelize';
import { StreamService } from './stream.service';
import { Follow } from '../follow/models/follow.model';

interface StreamRequest {
  senderId: string;
  receiverId: string;
  accepted?: boolean;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class StreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private streamRequests: StreamRequest[] = [];
  private activeStreams: Map<string, string[]> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User) private readonly userModel: typeof User,
    @Inject(forwardRef(() => StreamService))
    private readonly streamService: StreamService,
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      const token = client.handshake.query.token as string;
      if (!token) throw new UnauthorizedException('Token required');

      const payload = this.jwtService.verify(token, {
        secret: process.env.ACCESS_TOKEN_KEY,
      });

      const user = await this.userModel.findByPk(payload.id);
      if (!user) throw new UnauthorizedException('User not found');

      client.data.user = user;
      client.join(`user_${user.id}`);

      console.log(`${user.username} connected`);
      this.server.emit('user_connected', { username: user.username });
    } catch (error) {
      console.error('Connection error:', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    if (client.data.user) {
      console.log(`${client.data.user.username} disconnected`);
      this.server.emit('user_disconnected', {
        username: client.data.user.username,
      });
    }
  }

  @SubscribeMessage('startStream')
  handleStartStream(@ConnectedSocket() client: Socket) {
    const user = client.data.user;
    if (!user) {
      return client.emit('error', { message: 'Unauthorized' });
    }

    const userId = user.id.toString();

    if (this.activeStreams.has(userId)) {
      return client.emit('error', { message: 'Stream already active' });
    }

    this.activeStreams.set(userId, []);
    client.join(`stream_${userId}`);

    console.log(`${user.username} started stream`);

    this.server.emit('streamStarted', {
      userId,
      username: user.username,
      message: 'Live stream started!',
    });

    client.emit('streamStartedConfirmation', {
      userId,
      message: 'Your stream has started',
    });
  }

  notifyFollowers(
    @MessageBody()
    { streamerId, followerIds }: { streamerId: number; followerIds: number[] },
  ) {
    followerIds.forEach((followerId) => {
      this.server.to(`user_${followerId}`).emit('newStream', {
        streamerId,
        message: 'A new stream is available!',
      });
    });
  }

  @SubscribeMessage('joinStream')
  async handleJoinStream(
    @ConnectedSocket() client: Socket,
    @MessageBody() { streamId }: { streamId: string },
  ) {
    const user = client.data.user;
    if (!user) {
      return client.emit('error', { message: 'Unauthorized' });
    }

    const stream = await this.userModel.findByPk(Number(streamId), {
      attributes: ['id', 'username', 'profile_visibility'],
      include: [
        {
          model: Follow,
          as: 'followers',
          attributes: ['follower_id'],
          where: { status: 'accepted' },
          required: false,
        },
      ],
    });

    if (!stream) {
      return client.emit('error', { message: 'Stream not found' });
    }

    const isOwner = user.id === stream.id;
    const isFollower = stream.followers?.some((f) => f.follower_id === user.id);

    if (stream.profile_visibility === 'private' && !isOwner && !isFollower) {
      return client.emit('error', {
        message: 'Access denied: You are not a follower',
      });
    }

    client.join(`stream_${streamId}`);

    // Foydalanuvchini aktivlar ro'yxatiga qo'shish
    const viewers = this.activeStreams.get(streamId) || [];
    if (!viewers.includes(user.id.toString())) {
      viewers.push(user.id.toString());
      this.activeStreams.set(streamId, viewers);
    }

    this.server.to(`user_${streamId}`).emit('viewerJoined', {
      viewerId: user.id,
      username: user.username,
    });

    client.emit('streamJoined', { streamId, username: user.username });
  }

  @SubscribeMessage('leaveStream')
  handleLeaveStream(
    @ConnectedSocket() client: Socket,
    @MessageBody() { streamId }: { streamId: string },
  ) {
    const user = client.data.user;
    if (!user) return client.emit('error', { message: 'Unauthorized' });

    client.leave(`stream_${streamId}`);

    const viewers = this.activeStreams.get(streamId);
    if (viewers) {
      const updatedViewers = viewers.filter((id) => id !== user.id.toString());
      this.activeStreams.set(streamId, updatedViewers);
    }

    this.server.to(`user_${streamId}`).emit('viewerLeft', {
      viewerId: user.id,
      username: user.username,
    });

    client.emit('streamLeft', { streamId });
  }

  @SubscribeMessage('sendRequestToJoin')
  handleSendRequest(@MessageBody() { senderId, receiverId }: StreamRequest) {
    const request: StreamRequest = { senderId, receiverId };
    this.streamRequests.push(request);
    this.server.to(`user_${receiverId}`).emit('joinRequest', request);
  }

  @SubscribeMessage('acceptRequest')
  handleAcceptRequest(@MessageBody() { senderId, receiverId }: StreamRequest) {
    const requestIndex = this.streamRequests.findIndex(
      (req) => req.senderId === senderId && req.receiverId === receiverId,
    );

    if (requestIndex !== -1) {
      this.streamRequests.splice(requestIndex, 1);

      if (this.activeStreams.has(receiverId)) {
        this.activeStreams.get(receiverId)?.push(senderId);
      } else {
        this.activeStreams.set(receiverId, [senderId]);
      }

      this.server
        .to(`user_${senderId}`)
        .emit('requestAccepted', { receiverId });
      this.server.to(`user_${receiverId}`).emit('userJoined', { senderId });
    }
  }

  @SubscribeMessage('rejectRequest')
  handleRejectRequest(@MessageBody() { senderId, receiverId }: StreamRequest) {
    this.streamRequests = this.streamRequests.filter(
      (req) => req.senderId !== senderId || req.receiverId !== receiverId,
    );
    this.server.to(`user_${senderId}`).emit('requestRejected', { receiverId });
  }

  @SubscribeMessage('stopStream')
  handleStopStream(@MessageBody() { userId }: { userId: string }) {
    this.activeStreams.delete(userId);
    this.server.emit('streamStopped', { userId });
  }
}
