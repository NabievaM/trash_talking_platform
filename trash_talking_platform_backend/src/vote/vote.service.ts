import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Vote } from './models/vote.model';
import { CreateVoteDto } from './dto/create-vote.dto';
import { ChallengeEntry } from '../challenge-entry/models/challenge-entry.model';
import { Challenge } from '../challenge/models/challenge.model';

@Injectable()
export class VoteService {
  constructor(@InjectModel(Vote) private voteModel: typeof Vote) {}

  async create(createVoteDto: CreateVoteDto, userId: number): Promise<Vote> {
    const challengeEntry = await ChallengeEntry.findByPk(
      createVoteDto.challenge_entry_id,
      {
        attributes: ['id', 'user_id', 'challenge_id'],
        include: [
          {
            model: Challenge,
            include: [
              {
                association: 'user',
                include: [
                  {
                    association: 'followers',
                    attributes: ['follower_id', 'status'],
                  },
                ],
              },
            ],
          },
        ],
      },
    );

    if (!challengeEntry) {
      throw new NotFoundException('Challenge entry not found.');
    }

    if (challengeEntry.user_id === userId) {
      throw new ForbiddenException(
        'You cannot vote for your own challenge entry.',
      );
    }

    const challengeOwner = challengeEntry.challenge.user;

    if (!challengeOwner) {
      throw new NotFoundException('Challenge owner not found.');
    }

    const isPublicProfile = challengeOwner.profile_visibility === 'public';
    const isFollowerAccepted = challengeOwner.followers?.some(
      (follower) =>
        follower.follower_id === userId && follower.status === 'accepted',
    );

    if (
      !isPublicProfile &&
      challengeOwner.id !== userId &&
      !isFollowerAccepted
    ) {
      throw new ForbiddenException(
        'You do not have permission to vote for this challenge.',
      );
    }

    const existingVote = await this.voteModel.findOne({
      where: {
        user_id: userId,
      },
      include: [
        {
          model: ChallengeEntry,
          where: { challenge_id: challengeEntry.challenge_id },
        },
      ],
      limit: 1,
    });

    if (existingVote) {
      throw new ForbiddenException(
        'You have already voted for this challenge.',
      );
    }

    return this.voteModel.create({
      user_id: userId,
      challenge_entry_id: createVoteDto.challenge_entry_id,
    });
  }

  async findAll(userId: number, isAdmin: boolean): Promise<Vote[]> {
    if (isAdmin) {
      return await this.voteModel.findAll({ include: { all: true } });
    }

    const userChallenges = await Challenge.findAll({
      where: { user_id: userId },
      attributes: ['id'],
    });

    if (userChallenges.length === 0) {
      throw new ForbiddenException(
        'You can only view votes for challenges you have created.',
      );
    }

    const challengeIds = userChallenges.map((challenge) => challenge.id);

    return await this.voteModel.findAll({
      include: [
        {
          model: ChallengeEntry,
          where: { challenge_id: challengeIds },
        },
      ],
    });
  }

  async findOne(id: number, userId: number, isAdmin: boolean): Promise<Vote> {
    const vote = await this.voteModel.findByPk(id, {
      include: [ChallengeEntry],
    });

    if (!vote) {
      throw new NotFoundException(`Vote with ID ${id} not found.`);
    }

    if (!isAdmin && vote.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to view this vote.',
      );
    }

    return vote;
  }

  async remove(id: number, userId: number): Promise<void> {
    const vote = await this.voteModel.findOne({ where: { id } });

    if (!vote) {
      throw new NotFoundException(`Vote with ID ${id} not found.`);
    }

    if (vote.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this vote.',
      );
    }

    await vote.destroy();
  }
}
