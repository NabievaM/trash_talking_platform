import {
  HttpException,
  HttpStatus,
  Injectable,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Notification } from './models/notification.model';
import { NotificationGateway } from './notification.gateway';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationReader } from '../notification-readers/models/notification-reader.model';
import { User } from '../user/models/user.model';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification)
    private notificationRepository: typeof Notification,
    @InjectModel(NotificationReader)
    private notificationReaderRepository: typeof NotificationReader,
    @Inject(forwardRef(() => NotificationGateway))
    private readonly notificationGateway: NotificationGateway,
    @InjectModel(User)
    private readonly userRepo: typeof User,
  ) {}

  async create(createNotificationDto: CreateNotificationDto, userId: number) {
    const notification = await this.notificationRepository.create({
      ...createNotificationDto,
      user_id: userId,
    });

    this.notificationGateway.sendNotification(notification.message);

    return notification;
  }

  async findAll(isAdmin: boolean): Promise<Notification[]> {
    return await this.notificationRepository.findAll({
      include: isAdmin
        ? [{ model: NotificationReader }, { association: 'user' }]
        : [],
    });
  }

  async getById(id: number, isAdmin: boolean): Promise<Notification> {
    const notification = await this.notificationRepository.findByPk(id, {
      include: isAdmin
        ? [{ model: NotificationReader }, { association: 'user' }]
        : [],
    });

    if (!notification) {
      throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
    }

    return notification;
  }

  async updateById(
    id: number,
    updateNotificationDto: UpdateNotificationDto,
    userId: number,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.findByPk(id);

    if (!notification) {
      throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
    }

    if (notification.user_id !== userId) {
      throw new HttpException(
        'You can only edit your own notifications',
        HttpStatus.FORBIDDEN,
      );
    }

    const [count, updatedNotification] =
      await this.notificationRepository.update(updateNotificationDto, {
        where: { id },
        returning: true,
      });

    if (count === 0) {
      throw new HttpException(
        'Failed to update notification',
        HttpStatus.NOT_FOUND,
      );
    }

    return updatedNotification.length ? updatedNotification[0] : null;
  }

  async deleteById(id: number, userId: number): Promise<number> {
    const notification = await this.notificationRepository.findByPk(id);

    if (!notification) {
      throw new HttpException('Notification not found', HttpStatus.NOT_FOUND);
    }

    if (notification.user_id !== userId) {
      throw new HttpException(
        'You can only delete your own notifications',
        HttpStatus.FORBIDDEN,
      );
    }

    return await this.notificationRepository.destroy({ where: { id } });
  }
}
