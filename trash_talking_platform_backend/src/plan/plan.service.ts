import {
  Injectable,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Plan } from './models/plan.model';
import { NotificationGateway } from '../notification/notification.gateway';
import { Op } from 'sequelize';

@Injectable()
export class PlanService {
  constructor(
    @InjectModel(Plan) private PlanRepository: typeof Plan,
    @Inject(forwardRef(() => NotificationGateway))
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async create(createPlanDto: CreatePlanDto): Promise<Plan> {
    const existingPlan = await this.PlanRepository.findOne({
      where: { name: createPlanDto.name },
    });

    if (existingPlan) {
      throw new BadRequestException('Plan already exists!');
    }

    const newPlan = await this.PlanRepository.create(createPlanDto);

    this.notificationGateway.sendNotification(
      `A new plan has been added: ${newPlan.name}`,
    );

    return newPlan;
  }

  async findAll(): Promise<Plan[]> {
    return await this.PlanRepository.findAll({ include: { all: true } });
  }

  async search({ name }) {
    const where = {};

    if (name) {
      where['name'] = {
        [Op.iLike]: `%${name}%`,
      };
    }
    const plan = await Plan.findAll({ where });
    if (!plan) {
      throw new BadRequestException('plan not found');
    }
    return plan;
  }

  async getById(id: number): Promise<Plan> {
    return await this.PlanRepository.findByPk(id, {
      include: { all: true },
    });
  }

  async deleteById(id: number): Promise<number> {
    return await this.PlanRepository.destroy({ where: { id } });
  }

  async updateById(id: number, updatePlanDto: UpdatePlanDto): Promise<Plan> {
    const Plan = await this.PlanRepository.update(updatePlanDto, {
      where: { id },
      returning: true,
    });

    return Plan[1][0];
  }
}
