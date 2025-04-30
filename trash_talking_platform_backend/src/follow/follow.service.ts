import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Follow } from '../follow/models/follow.model';
import { CreateFollowDto } from './dto/create-follow.dto';
import { User } from '../user/models/user.model';
import { ProfileVisibility } from '../user/dto/signup-user.dto';
import { NotificationGateway } from '../notification/notification.gateway';

@Injectable()
export class FollowService {
  constructor(
    @InjectModel(Follow) private followModel: typeof Follow,
    @InjectModel(User) private userModel: typeof User,
    @Inject(NotificationGateway)
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async create(dto: CreateFollowDto, followerId: number) {
    if (followerId === dto.following_id) {
      throw new ForbiddenException('You cannot follow yourself.');
    }

    const existingFollow = await this.findOne(followerId, dto.following_id);
    if (existingFollow) {
      throw new ForbiddenException('You are already following this user.');
    }

    const followingUser = await this.userModel.findByPk(dto.following_id);
    if (!followingUser) {
      throw new NotFoundException('User not found.');
    }

    const status =
      followingUser.profile_visibility === ProfileVisibility.PUBLIC
        ? 'accepted'
        : 'pending';

    const follow = await this.followModel.create({
      follower_id: followerId,
      following_id: dto.following_id,
      status,
    });

    const followerUser = await this.userModel.findByPk(followerId);

    if (followerUser) {
      let message = '';

      if (status === 'accepted') {
        message = `${followerUser.username} has subscribed to you.`;
      } else {
        message = `${followerUser.username} sent you a follow request`;
      }

      this.notificationGateway.sendFollowNotification(
        dto.following_id,
        message,
      );
    }

    return follow;
  }

  async findOne(followerId: number, followingId: number) {
    return await this.followModel.findOne({
      where: { follower_id: followerId, following_id: followingId },
      include: [{ all: true }],
    });
  }

  async findAll() {
    return await this.followModel.findAll({
      where: { status: 'accepted' },
      include: { all: true },
    });
  }

  async checkFollowStatus(followerId: number, followingId: number) {
    const follow = await this.findOne(followerId, followingId);
    if (!follow) {
      return { isFollowing: false };
    }
    return { isFollowing: true, followDetails: follow };
  }

  async delete(followerId: number, followingId: number) {
    const follow = await this.findOne(followerId, followingId);
    if (!follow) {
      throw new NotFoundException('Follow record not found.');
    }
    if (follow.follower_id !== followerId) {
      throw new ForbiddenException(
        'You do not have permission to delete this follow record.',
      );
    }
    await follow.destroy();
    return { message: 'User unfollowed successfully.' };
  }

  async removeFollower(targetUserId: number, followerId: number) {
    const follow = await this.followModel.findOne({
      where: {
        follower_id: followerId,
        following_id: targetUserId,
        status: 'accepted',
      },
    });

    if (!follow) {
      throw new NotFoundException('Follower not found.');
    }

    await follow.destroy();
    return { message: 'Follower removed successfully.' };
  }

  async findPendingRequests(targetUserId: number) {
    return await this.followModel.findAll({
      where: { following_id: targetUserId, status: 'pending' },
      include: [{ all: true }],
    });
  }

  async updateFollowStatus(
    requesterId: number,
    targetId: number,
    accept: boolean,
  ) {
    const follow = await this.findOne(requesterId, targetId);
    if (!follow) {
      throw new NotFoundException('Follow request not found.');
    }
    if (follow.status !== 'pending') {
      throw new ForbiddenException('This follow request is already processed.');
    }
    if (accept) {
      follow.status = 'accepted';
      await follow.save();
      return { message: 'Follow request accepted.' };
    } else {
      await follow.destroy();
      return { message: 'Follow request rejected.' };
    }
  }

  async getFollowers(targetUserId: number, requesterId: number) {
    const targetUser = await this.userModel.findByPk(targetUserId);
    if (!targetUser) {
      throw new NotFoundException('User not found.');
    }
    if (
      targetUser.profile_visibility === ProfileVisibility.PRIVATE &&
      requesterId !== targetUserId
    ) {
      const followRecord = await this.followModel.findOne({
        where: {
          follower_id: requesterId,
          following_id: targetUserId,
          status: 'accepted',
        },
      });
      if (!followRecord) {
        throw new ForbiddenException('This profile is private.');
      }
    }
    return await this.followModel.findAll({
      where: { following_id: targetUserId, status: 'accepted' },
      include: [{ model: User, as: 'follower' }],
    });
  }

  async getFollowerIds(userId: number): Promise<number[]> {
    const followers = await this.followModel.findAll({
      where: { following_id: userId, status: 'accepted' },
      attributes: ['follower_id'],
    });
    return followers.map(f => f.follower_id);
  }
  

  async getFollowing(targetUserId: number, requesterId: number) {
    const targetUser = await this.userModel.findByPk(targetUserId);
    if (!targetUser) {
      throw new NotFoundException('User not found.');
    }
    if (
      targetUser.profile_visibility === ProfileVisibility.PRIVATE &&
      requesterId !== targetUserId
    ) {
      const followRecord = await this.followModel.findOne({
        where: {
          follower_id: requesterId,
          following_id: targetUserId,
          status: 'accepted',
        },
      });
      if (!followRecord) {
        throw new ForbiddenException('This profile is private.');
      }
    }
    return await this.followModel.findAll({
      where: { follower_id: targetUserId, status: 'accepted' },
      include: [{ model: User, as: 'following' }],
    });
  }
}
