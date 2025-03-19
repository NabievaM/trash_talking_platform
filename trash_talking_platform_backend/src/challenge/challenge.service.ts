import {
  HttpException,
  HttpStatus,
  Injectable,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Challenge } from './models/challenge.model';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { NotificationGateway } from '../notification/notification.gateway';
import { FollowService } from '../follow/follow.service';
import { UserService } from '../user/user.service';
import { Op } from 'sequelize';

@Injectable()
export class ChallengeService {
  constructor(
    @InjectModel(Challenge) private challengeRepository: typeof Challenge,
    @Inject(NotificationGateway)
    private readonly notificationGateway: NotificationGateway,
    @Inject(forwardRef(() => FollowService))
    private readonly followService: FollowService,
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}

  async create(
    createChallengeDto: CreateChallengeDto,
    userId: number,
    isAdmin: boolean,
  ) {
    const challenge = await this.challengeRepository.create({
      ...createChallengeDto,
      user_id: userId,
    });

    const user = await this.userService.findOne(userId);
    if (!user) return challenge;

    if (isAdmin) {
      this.notificationGateway.sendNotification(
        `${user.username} created a new challenge: ${challenge.title}`,
      );
      return challenge;
    }

    if (user.profile_visibility === 'private') {
      const followers = await this.followService.getFollowers(userId, userId);
      if (!followers || followers.length === 0) return challenge;

      const acceptedFollowers = followers
        .filter((f) => f.status === 'accepted')
        .map((f) => f.follower_id);

      if (acceptedFollowers.length > 0) {
        this.notificationGateway.sendNewChallengeNotification(
          acceptedFollowers,
          challenge,
        );
      }
      return challenge;
    }

    if (user.profile_visibility === 'public') {
      const followers = await this.followService.getFollowers(userId, userId);
      if (!followers || followers.length === 0) return challenge;

      const allFollowers = followers.map((f) => f.follower_id);
      this.notificationGateway.sendNewChallengeNotification(
        allFollowers,
        challenge,
      );
    }

    return challenge;
  }

  async findAll(userId: number, isAdmin: boolean): Promise<Challenge[]> {
    const challenges = await this.challengeRepository.findAll({
      include: [
        { association: 'user', include: [{ association: 'followers' }] },
      ],
    });

    if (isAdmin) {
      return challenges;
    }

    return challenges.filter((challenge) => {
      if (!challenge.user) return false;
      if (challenge.user.profile_visibility === 'public') return true;
      if (challenge.user_id === userId) return true;
      if (
        challenge.user.followers?.some(
          (sub) => sub.follower_id === userId && sub.status === 'accepted',
        )
      )
        return true;
      return false;
    });
  }

  async getById(id: number, userId: number): Promise<Challenge> {
    const challenge = await this.challengeRepository.findByPk(id, {
      include: [
        { association: 'user', include: [{ association: 'followers' }] },
      ],
    });

    if (!challenge) {
      throw new HttpException('Challenge not found', HttpStatus.NOT_FOUND);
    }

    if (!challenge.user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (
      challenge.user.profile_visibility === 'public' ||
      challenge.user_id === userId ||
      challenge.user.followers?.some(
        (sub) => sub.follower_id === userId && sub.status === 'accepted',
      )
    ) {
      return challenge;
    }

    throw new HttpException(
      'You do not have permission to view this challenge.',
      HttpStatus.FORBIDDEN,
    );
  }

  async updateById(
    id: number,
    updateChallengeDto: UpdateChallengeDto,
    userId: number,
  ): Promise<Challenge> {
    const challenge = await this.challengeRepository.findByPk(id);

    if (!challenge) {
      throw new HttpException('Challenge not found', HttpStatus.NOT_FOUND);
    }

    if (challenge.user_id !== userId) {
      throw new HttpException(
        'You do not have permission to edit this challenge.',
        HttpStatus.FORBIDDEN,
      );
    }

    const [_, updatedChallenges] = await this.challengeRepository.update(
      updateChallengeDto,
      {
        where: { id },
        returning: true,
      },
    );

    return updatedChallenges[0];
  }

  async deleteById(
    id: number,
    userId: number,
    isAdmin: boolean,
  ): Promise<number> {
    const challenge = await this.challengeRepository.findByPk(id);

    if (!challenge) {
      throw new HttpException('Challenge not found', HttpStatus.NOT_FOUND);
    }

    if (challenge.user_id !== userId && !isAdmin) {
      throw new HttpException(
        'You do not have permission to delete this challenge.',
        HttpStatus.FORBIDDEN,
      );
    }

    return await this.challengeRepository.destroy({ where: { id } });
  }

  async search({ title }, userId: number) {
    const where: any = title ? { title: { [Op.iLike]: `%${title}%` } } : {};
    const challenges = await this.challengeRepository.findAll({
      where,
      include: [
        { association: 'user', include: [{ association: 'followers' }] },
      ],
    });

    return challenges.filter((challenge) => {
      if (!challenge.user) return false;
      if (challenge.user.profile_visibility === 'public') return true;
      if (challenge.user_id === userId) return true;
      if (
        challenge.user.followers?.some(
          (sub) => sub.follower_id === userId && sub.status === 'accepted',
        )
      )
        return true;
      return false;
    });
  }
}
