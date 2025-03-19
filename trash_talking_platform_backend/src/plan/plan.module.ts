import { Module, forwardRef } from '@nestjs/common';
import { PlanService } from './plan.service';
import { PlanController } from './plan.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Plan } from './models/plan.model';
import { JwtModule } from '@nestjs/jwt';
import { Notification } from '../notification/models/notification.model';
import { NotificationGateway } from '../notification/notification.gateway';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';
import { User } from '../user/models/user.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Plan, Notification, User]),
    JwtModule,
    forwardRef(() => NotificationModule),
    forwardRef(() => UserModule),
  ],
  controllers: [PlanController],
  providers: [PlanService, NotificationGateway],
  exports: [PlanService],
})
export class PlanModule {}
