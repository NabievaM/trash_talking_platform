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
import { FollowService } from '../follow/follow.service';

interface StreamRequest {
  senderId: string;
  receiverId: string;
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
  private activeStreams: Map<string, Set<string>> = new Map();
  private userSockets: Map<number, string> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User) private readonly userModel: typeof User,
    @Inject(forwardRef(() => StreamService))
    private readonly streamService: StreamService,
    private readonly followService: FollowService,
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
      this.userSockets.set(user.id, client.id);

      console.log(`${user.username} connected`);
      this.server.emit('user_connected', {
        userId: user.id,
        username: user.username,
      });
    } catch (error) {
      console.error('Connection error:', error.message);
      client.disconnect();
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const user = client.data.user;
    if (!user) return;

    console.log(`${user.username} disconnected`);
    this.userSockets.delete(user.id);

    this.activeStreams.forEach((viewers, streamId) => {
      if (viewers.has(user.id.toString())) {
        viewers.delete(user.id.toString());
        this.server.to(`stream_${streamId}`).emit('viewerLeft', {
          viewerId: user.id,
          username: user.username,
        });
      }
    });

    this.server.emit('user_disconnected', {
      userId: user.id,
      username: user.username,
    });
  }

  @SubscribeMessage('offer')
  handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { targetUserId: number; offer: RTCSessionDescriptionInit },
  ) {
    const sender = client.data.user;
    if (!sender) return;

    this.server.to(`user_${data.targetUserId}`).emit('offer', {
      senderId: sender.id,
      offer: data.offer,
    });
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { targetUserId: number; answer: RTCSessionDescriptionInit },
  ) {
    const sender = client.data.user;
    if (!sender) return;

    this.server.to(`user_${data.targetUserId}`).emit('answer', {
      senderId: sender.id,
      answer: data.answer,
    });
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { targetUserId: number; candidate: RTCIceCandidate },
  ) {
    const sender = client.data.user;
    if (!sender) return;

    this.server.to(`user_${data.targetUserId}`).emit('ice-candidate', {
      senderId: sender.id,
      candidate: data.candidate,
    });
  }

  @SubscribeMessage('startStream')
  async handleStartStream(
    @MessageBody() data: { userId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const stream = await this.streamService.createStream(data.userId);
      this.activeStreams.set(data.userId.toString(), new Set());
      client.emit('streamStarted', { stream });

      const followers = await this.followService.getFollowerIds(data.userId);
      this.notifyFollowers({
        streamerId: data.userId,
        followerIds: followers,
      });
    } catch (err) {
      client.emit('error', { message: err.message });
    }
  }

  notifyFollowers(data: { streamerId: number; followerIds: number[] }) {
    data.followerIds.forEach((followerId) => {
      this.server.to(`user_${followerId}`).emit('stream-started', {
        streamerId: data.streamerId,
      });
    });
  }

  @SubscribeMessage('joinStream')
  async handleJoinStream(
    @ConnectedSocket() client: Socket,
    @MessageBody() { streamId }: { streamId: string },
  ) {
    const user = client.data.user;
    if (!user) return client.emit('error', { message: 'Unauthorized' });

    const streamUser = await this.userModel.findByPk(Number(streamId), {
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

    if (!streamUser)
      return client.emit('error', { message: 'Stream not found' });

    const isOwner = user.id === streamUser.id;
    const isFollower = streamUser.followers?.some(
      (f) => f.follower_id === user.id,
    );

    if (
      streamUser.profile_visibility === 'private' &&
      !isOwner &&
      !isFollower
    ) {
      return client.emit('error', { message: 'Access denied' });
    }

    client.join(`stream_${streamId}`);

    const viewers = this.activeStreams.get(streamId) || new Set();
    viewers.add(user.id.toString());
    this.activeStreams.set(streamId, viewers);

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
      viewers.delete(user.id.toString());
    }

    this.server.to(`user_${streamId}`).emit('viewerLeft', {
      viewerId: user.id,
      username: user.username,
    });

    client.emit('streamLeft', { streamId });
  }

  @SubscribeMessage('sendRequestToJoin')
  handleSendRequest(@MessageBody() { senderId, receiverId }: StreamRequest) {
    this.streamRequests.push({ senderId, receiverId });
    this.server.to(`user_${receiverId}`).emit('joinRequest', { senderId });
  }

  @SubscribeMessage('acceptRequest')
  handleAcceptRequest(@MessageBody() { senderId, receiverId }: StreamRequest) {
    this.streamRequests = this.streamRequests.filter(
      (req) => req.senderId !== senderId || req.receiverId !== receiverId,
    );

    const viewers = this.activeStreams.get(receiverId) || new Set();
    viewers.add(senderId);
    this.activeStreams.set(receiverId, viewers);

    this.server.to(`user_${senderId}`).emit('requestAccepted', { receiverId });
    this.server.to(`user_${receiverId}`).emit('userJoined', { senderId });
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
