import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Stream } from './models/stream.model';
import { User } from '../user/models/user.model';
import { Follow } from '../follow/models/follow.model';
import { ProfileVisibility } from '../user/dto/signup-user.dto';
import { StreamGateway } from './stream.gateway';
import { Op } from 'sequelize';

@Injectable()
export class StreamService {
  constructor(
    @InjectModel(Stream) private readonly streamModel: typeof Stream,
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(Follow) private readonly followModel: typeof Follow,
    @Inject(forwardRef(() => StreamGateway))
    private readonly streamGateway: StreamGateway,
  ) {}

  async createStream(streamerId: number): Promise<Stream> {
    const existingStream = await this.streamModel.findOne({
      where: { streamer_id: streamerId, is_active: true },
    });

    if (existingStream) {
      throw new BadRequestException('You already have an active stream.');
    }

    const streamer = await this.userModel.findByPk(streamerId);
    if (!streamer) {
      throw new NotFoundException('Streamer not found');
    }

    const stream = await this.streamModel.create({
      streamer_id: streamerId,
      is_active: true,
    });

    const followers = await this.followModel.findAll({
      where: {
        following_id: streamerId,
        status: 'accepted',
      },
      include: [{ model: User, as: 'follower' }],
    });

    this.notifyFollowers(
      streamerId,
      followers.map((f) => f.follower.id),
    );

    return stream;
  }

  private notifyFollowers(streamerId: number, followerIds: number[]): void {
    this.streamGateway.notifyFollowers({ streamerId, followerIds });
  }

  async getActiveStream(
    streamerId: number,
    userId: number,
    isAdmin = false,
  ): Promise<Stream | null> {
    const user = await this.userModel.findByPk(userId, {
      include: [{ model: Follow, as: 'followers' }],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const whereCondition: any = { is_active: true, streamer_id: streamerId };

    const stream = await this.streamModel.findOne({
      where: whereCondition,
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'profile_visibility'],
          include: [
            {
              model: Follow,
              as: 'followers',
              attributes: ['follower_id', 'status'],
              where: { status: 'accepted' },
              required: false,
            },
          ],
        },
      ],
    });

    if (!stream) {
      throw new NotFoundException(
        `Active stream for user ${streamerId} not found`,
      );
    }

    const streamer = stream.user;
    if (!streamer) {
      throw new NotFoundException(`Streamer not found for stream ${stream.id}`);
    }

    if (isAdmin || streamer.id === userId) return stream;

    if (streamer.profile_visibility === ProfileVisibility.PUBLIC) return stream;

    const isFollower = streamer.followers?.some(
      (f) => f.follower_id === userId && f.status === 'accepted',
    );

    if (!isFollower) {
      throw new ForbiddenException('Access to this stream is restricted');
    }

    return stream;
  }

  async getAllActiveStreams(
    userId: number,
    isAdmin: boolean,
  ): Promise<Stream[]> {
    const user = await this.userModel.findOne({
      where: { id: userId },
      include: [{ model: Follow, as: 'followers' }],
    });

    if (!user) throw new NotFoundException('User not found');

    const whereCondition: any = { is_active: true };

    if (!isAdmin) {
      whereCondition[Op.or] = [
        { '$user.id$': userId },
        { '$user.profile_visibility$': ProfileVisibility.PUBLIC },
        { '$user.followers.follower_id$': userId },
      ];
    }

    return this.streamModel.findAll({
      where: whereCondition,
      include: [
        {
          model: User,
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
        },
      ],
    });
  }

  async getStreamById(
    streamId: number,
    userId: number,
    isAdmin = false,
  ): Promise<Stream> {
    const user = await this.userModel.findByPk(userId, {
      include: [{ model: Follow, as: 'followers' }],
    });

    if (!user) throw new NotFoundException('User not found');

    const stream = await this.streamModel.findByPk(streamId, {
      include: [
        {
          model: User,
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
        },
      ],
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    const streamer = stream.user;

    if (isAdmin || streamer.id === userId) return stream;

    if (streamer.profile_visibility === ProfileVisibility.PUBLIC) return stream;

    const isFollower = streamer.followers.some((f) => f.follower_id === userId);

    if (!isFollower) {
      throw new ForbiddenException('Access to this stream is restricted');
    }

    return stream;
  }

  async getUserStreams(
    requestingUserId: number,
    targetUserId: number,
    isAdmin: boolean,
  ): Promise<Stream[]> {
    const user = await this.userModel.findByPk(targetUserId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!isAdmin && requestingUserId !== targetUserId) {
      throw new ForbiddenException('You can only access your own streams.');
    }

    const whereCondition: any = { streamer_id: targetUserId };
    if (!isAdmin) {
      whereCondition.streamer_id = requestingUserId;
    }

    return this.streamModel.findAll({
      where: whereCondition,
      include: [{ model: User, attributes: ['id', 'username'] }],
      order: [['createdAt', 'DESC']],
    });
  }

  async endStream(
    streamerId: number,
    userId: number,
    isAdmin = false,
  ): Promise<{ message: string }> {
    const stream = await this.getActiveStream(streamerId, userId, isAdmin);
    if (!stream) {
      throw new NotFoundException('Active stream not found');
    }

    if (!isAdmin && stream.streamer_id !== userId) {
      throw new ForbiddenException('You are not allowed to end this stream');
    }

    await stream.update({ is_active: false });

    return { message: 'The stream ended' };
  }

  async getStreamStats(
    streamId: number,
    userId: number,
    isAdmin = false,
  ): Promise<any> {
    const stream = await this.streamModel.findByPk(streamId, {
      include: [
        {
          model: User,
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
        },
      ],
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    const streamer = stream.user;

    // Viewer sonini olish
    const viewerCount = await this.followModel.count({
      where: { following_id: streamer.id },
    });

    // Adminga to'liq ma'lumotni qaytarish
    if (isAdmin) {
      return {
        streamId: stream.id,
        isActive: stream.is_active,
        viewerCount,
        startedAt: stream.createdAt,
        streamer: {
          id: streamer.id,
          username: streamer.username,
        },
      };
    }

    const isOwner = streamer.id === userId;

    // Egasi yoki public profil bo'lsa, to'liq ma'lumot
    if (isOwner || streamer.profile_visibility === ProfileVisibility.PUBLIC) {
      return {
        streamId: stream.id,
        isActive: stream.is_active,
        viewerCount,
        ...(isOwner && {
          startedAt: stream.createdAt,
          streamer: {
            id: streamer.id,
            username: streamer.username,
          },
        }),
      };
    }

    // Followerligini tekshirish
    const isFollower = streamer.followers?.some(
      (f) => f.follower_id === userId,
    );

    // Follower bo'lmasa, ruxsat yo'q
    if (!isFollower) {
      throw new ForbiddenException('Access to this stream is restricted');
    }

    // Follower bo'lsa, ma'lumotni qaytarish
    return {
      streamId: stream.id,
      isActive: stream.is_active,
      viewerCount,
    };
  }

  async deleteStream(
    streamId: number,
    userId: number,
    isAdmin = false,
  ): Promise<void> {
    const stream = await this.streamModel.findByPk(streamId, {
      include: [{ model: User, attributes: ['id'] }],
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    if (!isAdmin && stream.user.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this stream',
      );
    }

    await stream.destroy();
  }
}
