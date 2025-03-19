import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Subscription } from './models/subscription.model';
import { Plan } from '../plan/models/plan.model';
import { Op } from 'sequelize';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(Subscription)
    private readonly SubscriptionRepository: typeof Subscription,
  ) {}

  async create(
    user_id: number,
    createSubscriptionDto: CreateSubscriptionDto,
  ): Promise<Subscription> {
    return await this.SubscriptionRepository.create({
      ...createSubscriptionDto,
      user_id,
    });
  }

  async findAll(): Promise<Subscription[]> {
    return await this.SubscriptionRepository.findAll({
      include: { all: true },
    });
  }

  async search({
    start_date,
    end_date,
    plan_name,
  }: {
    start_date?: string;
    end_date?: string;
    plan_name?: string;
  }) {
    const where: Record<string, any> = {};

    if (start_date && end_date) {
      where.start_date = { [Op.between]: [start_date, end_date] };
    } else if (start_date) {
      where.start_date = { [Op.gte]: start_date };
    } else if (end_date) {
      where.start_date = { [Op.lte]: end_date };
    }

    const include: any[] = [];

    if (plan_name) {
      include.push({
        model: Plan,
        as: 'plan',
        where: {
          name: {
            [Op.iLike]: `%${plan_name}%`,
          },
        },
        required: true,
      });
    }

    const subscriptions = await this.SubscriptionRepository.findAll({
      where,
      include,
    });

    if (!subscriptions.length) {
      throw new NotFoundException('No subscriptions found');
    }

    return subscriptions;
  }

  async findOne(id: number): Promise<Subscription> {
    const subscription = await this.SubscriptionRepository.findByPk(id);
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }
    return subscription;
  }

  async update(
    id: number,
    updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<Subscription> {
    const subscription = await this.findOne(id);
    await subscription.update(updateSubscriptionDto);
    return subscription;
  }

  async deleteById(id: number): Promise<{ deleted: boolean }> {
    const deletedCount = await this.SubscriptionRepository.destroy({
      where: { id },
    });
    if (!deletedCount) {
      throw new NotFoundException('Subscription not found');
    }
    return { deleted: true };
  }
}
