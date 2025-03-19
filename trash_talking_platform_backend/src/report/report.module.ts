import { Module, forwardRef } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Report } from './models/report.model';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../user/models/user.model';
import { NotificationGateway } from '../notification/notification.gateway';
import { Notification } from '../notification/models/notification.model';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Report, User, Notification]),
    JwtModule,
    forwardRef(() => NotificationModule),
  ],
  controllers: [ReportController],
  providers: [ReportService, NotificationGateway],
  exports: [ReportService],
})
export class ReportModule {}
