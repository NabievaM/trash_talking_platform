import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectModel } from '@nestjs/sequelize';
import { UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Advertisement } from '../advertisement/models/advertisement.model';
import { User } from '../user/models/user.model';
import { ProfileVisibility } from '../user/dto/signup-user.dto';

@WebSocketGateway({ namespace: '/notifications', cors: { origin: '*' } })
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger = new Logger('NotificationGateway');

  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User) private readonly userModel: typeof User,
  ) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    if (client.data?.user) return;
    try {
      const token = client.handshake.query.token as string;
      if (!token) throw new UnauthorizedException('Token required');

      const user = await this.jwtService.verifyAsync(token, {
        secret: process.env.ACCESS_TOKEN_KEY,
      });
      if (!user) throw new UnauthorizedException('Invalid user');

      client.data.user = user;
      client.join(`user-${user.id}`);

      this.logger.log(`User ${user.id} connected to notifications`);
    } catch (error) {
      client.disconnect();
    }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket) {
    const user = client.data?.user;
    if (user) {
      this.logger.log(`User ${user.id} disconnected from notifications`);
    }
  }

  async sendNotification(message: string) {
    this.server.emit('newNotification', { message });
  }

  async sendNewPostToFollowers(followerIds: number[], post: any) {
    for (const followerId of followerIds) {
      this.server.to(`user-${followerId}`).emit('newPost', { post });
    }
  }

  async sendNewCommentNotification(userId: number, message: string) {
    this.server.to(`user-${userId}`).emit('newComment', { message });
  }

  async sendLikeNotification(userId: number, message: string) {
    this.server.to(`user-${userId}`).emit('newLike', { message });
  }

  async sendFollowNotification(userId: number, message: string) {
    this.server.to(`user-${userId}`).emit('newFollower', { message });
  }

  async sendNewAdvertisement(advertisement: Advertisement) {
    this.server.emit('newAdvertisement', { advertisement });
  }

  async sendNewChallengeNotification(followerIds: number[], challenge: any) {
    for (const followerId of followerIds) {
      this.server.to(`user-${followerId}`).emit('newChallenge', { challenge });
    }
  }

  async sendReportNotification(userId: number, message: string) {
    this.server.to(`user-${userId}`).emit('newReport', { message });
  }

  async sendStreamNotification(streamer: User) {
    if (!streamer) return;

    const message = `${streamer.username} started a livestream`;

    if (streamer.profile_visibility === ProfileVisibility.PUBLIC) {
      this.server.emit('newStream', { message, streamerId: streamer.id });
    } else {
      const followers = await streamer.$get('followers', {
        where: { status: 'accepted' },
      });

      for (const follower of followers) {
        this.server.to(`user-${follower.follower_id}`).emit('newStream', {
          message,
          streamerId: streamer.id,
        });
      }
    }

    this.logger.log(
      `Stream notification sent for streamer ${streamer.username}`,
    );
  }
}
