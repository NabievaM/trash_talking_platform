import {
  HttpException,
  HttpStatus,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ChallengeEntry } from './models/challenge-entry.model';
import { Challenge } from '../challenge/models/challenge.model';
import { CreateChallengeEntryDto } from './dto/create-challenge-entry.dto';
import { UpdateChallengeEntryDto } from './dto/update-challenge-entry.dto';
import { FilesService } from '../files/files.service';

@Injectable()
export class ChallengeEntryService {
  constructor(
    @InjectModel(ChallengeEntry)
    private challengeEntryRepository: typeof ChallengeEntry,
    private readonly fileService: FilesService,
    @InjectModel(Challenge) private challengeRepository: typeof Challenge,
  ) {}

  async create(
    createChallengeEntryDto: CreateChallengeEntryDto,
    image: any,
    userId: number,
  ) {
    const existingEntry = await this.challengeEntryRepository.findOne({
      where: {
        challenge_id: createChallengeEntryDto.challenge_id,
        user_id: userId,
      },
    });

    if (existingEntry) {
      throw new HttpException(
        'You have already joined this challenge.',
        HttpStatus.BAD_REQUEST,
      );
    }

    let fileName: string | null = null;
    if (image) {
      fileName = await this.fileService.createFile(image);
    }

    const challenge = await this.challengeRepository.findByPk(
      createChallengeEntryDto.challenge_id,
      {
        include: [
          { association: 'user', include: [{ association: 'followers' }] },
        ],
      },
    );

    if (!challenge) {
      throw new HttpException('Challenge not found', HttpStatus.NOT_FOUND);
    }

    const isAllowed =
      challenge.user.profile_visibility === 'public' ||
      challenge.user_id === userId ||
      challenge.user.followers?.some(
        (sub) => sub.follower_id === userId && sub.status === 'accepted',
      );

    if (!isAllowed) {
      throw new HttpException(
        'You do not have permission to join this challenge.',
        HttpStatus.FORBIDDEN,
      );
    }

    return await this.challengeEntryRepository.create({
      ...createChallengeEntryDto,
      image: fileName,
      user_id: userId,
    });
  }

  async findAll(userId: number, isAdmin: boolean): Promise<ChallengeEntry[]> {
    const challengeEntries = await this.challengeEntryRepository.findAll({
      include: [
        {
          association: 'challenge',
          include: [
            { association: 'user', include: [{ association: 'followers' }] },
          ],
        },
      ],
    });

    if (isAdmin) {
      return challengeEntries;
    }

    return challengeEntries.filter((entry) => {
      if (!entry.challenge || !entry.challenge.user) return false;

      const isAllowed =
        entry.challenge.user.profile_visibility === 'public' ||
        entry.challenge.user_id === userId ||
        entry.challenge.user.followers?.some(
          (sub) => sub.follower_id === userId && sub.status === 'accepted',
        );

      return isAllowed;
    });
  }

  async findOne(
    id: number,
    userId: number,
    isAdmin: boolean,
  ): Promise<ChallengeEntry> {
    const entry = await this.challengeEntryRepository.findByPk(id, {
      include: [
        {
          association: 'challenge',
          include: [
            { association: 'user', include: [{ association: 'followers' }] },
          ],
        },
      ],
    });

    if (!entry) {
      throw new HttpException(
        'Challenge Entry not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (!entry.challenge || !entry.challenge.user) {
      throw new HttpException('Challenge not found', HttpStatus.NOT_FOUND);
    }

    if (
      isAdmin ||
      entry.user_id === userId ||
      entry.challenge.user.profile_visibility === 'public' ||
      entry.challenge.user_id === userId ||
      entry.challenge.user.followers?.some(
        (sub) => sub.follower_id === userId && sub.status === 'accepted',
      )
    ) {
      return entry;
    }

    throw new HttpException(
      'You do not have permission to view this entry.',
      HttpStatus.FORBIDDEN,
    );
  }

  async update(
    id: number,
    updateChallengeEntryDto: UpdateChallengeEntryDto,
    userId: number,
  ): Promise<ChallengeEntry> {
    const entry = await this.challengeEntryRepository.findByPk(id);

    if (!entry) {
      throw new HttpException(
        'Challenge Entry not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (entry.user_id !== userId) {
      throw new HttpException(
        'You can only edit your own entry.',
        HttpStatus.FORBIDDEN,
      );
    }

    const [_, updatedEntries] = await this.challengeEntryRepository.update(
      updateChallengeEntryDto,
      {
        where: { id },
        returning: true,
      },
    );

    return updatedEntries[0];
  }

  async delete(id: number, userId: number, isAdmin: boolean): Promise<number> {
    const entry = await this.challengeEntryRepository.findByPk(id, {
      include: [{ association: 'challenge' }],
    });

    if (!entry) {
      throw new HttpException(
        'Challenge Entry not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (
      entry.user_id !== userId &&
      entry.challenge.user_id !== userId &&
      !isAdmin
    ) {
      throw new HttpException(
        'You do not have permission to delete this entry.',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.fileService.removeFile(entry.image);
    return await this.challengeEntryRepository.destroy({ where: { id } });
  }

  async updateImage(id: number, image: any, userId: number) {
    const challengeEntry = await this.challengeEntryRepository.findOne({
      where: { id },
    });

    if (!challengeEntry) {
      throw new HttpException(
        'Challenge Entry not found',
        HttpStatus.NOT_FOUND,
      );
    }

    if (challengeEntry.user_id !== userId) {
      throw new HttpException(
        'You can only update your own entry image.',
        HttpStatus.FORBIDDEN,
      );
    }

    return this.challengeEntryRepository.sequelize.transaction(async (t) => {
      if (challengeEntry.image) {
        const removed = await this.fileService.removeFile(challengeEntry.image);
        if (!removed) {
          throw new BadRequestException('Old image could not be removed');
        }
      }

      const fileName = await this.fileService.createFile(image);

      const [affectedCount, updatedChallengeEntry] =
        await this.challengeEntryRepository.update(
          { image: fileName },
          { where: { id }, returning: true, transaction: t },
        );

      if (!affectedCount) {
        throw new BadRequestException('Challenge Entry not updated');
      }

      return updatedChallengeEntry[0];
    });
  }
}
