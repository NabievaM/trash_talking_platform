import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Subscription } from './models/subscription.model';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../user/models/user.model';
import { Plan } from '../plan/models/plan.model';

@Module({
  imports: [SequelizeModule.forFeature([Subscription, User, Plan]), JwtModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
  exports: [SubscriptionService]
})
export class SubscriptionModule {}
