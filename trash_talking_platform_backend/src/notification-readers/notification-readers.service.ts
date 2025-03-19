import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { NotificationReader } from './models/notification-reader.model';
import { Notification } from '../notification/models/notification.model';
import { CreateNotificationReaderDto } from './dto/create-notification-reader.dto';
import { Sequelize } from 'sequelize-typescript';
import { Op } from 'sequelize';

@Injectable()
export class NotificationReadersService {
  constructor(
    @InjectModel(NotificationReader)
    private readonly notificationReaderRepository: typeof NotificationReader,
    @InjectModel(Notification)
    private readonly notificationRepository: typeof Notification,
    private readonly sequelize: Sequelize,
  ) {}

  async markAsRead(
    createNotificationReaderDto: CreateNotificationReaderDto,
    user_id: number,
  ) {
    const { notification_id } = createNotificationReaderDto;
    const transaction = await this.sequelize.transaction();

    try {
      const notification = await this.notificationRepository.findOne({
        where: { id: notification_id },
        include: [
          {
            model: NotificationReader,
            where: { user_id },
            required: false,
          },
        ],
        transaction,
      });

      if (!notification) {
        throw new HttpException(
          'Notification not found or unauthorized',
          HttpStatus.FORBIDDEN,
        );
      }

      const existingReader = await this.notificationReaderRepository.findOne({
        where: { notification_id, user_id },
        transaction,
      });

      if (existingReader) {
        return { message: 'Already marked as read' };
      }

      await this.notificationReaderRepository.create(
        { notification_id, user_id, is_read: true, read_at: new Date() },
        { transaction },
      );

      await transaction.commit();
      return { message: 'Notification marked as read' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getUnreadNotifications(user_id: number) {
    return await this.notificationRepository.findAll({
      include: [
        {
          model: NotificationReader,
          attributes: [],
          where: { user_id },
          required: false,
        },
      ],
      where: {
        id: {
          [Op.notIn]: Sequelize.literal(
            `(SELECT notification_id FROM notification_readers WHERE user_id = ${user_id})`,
          ),
        },
      },
    });
  }

  async findAll(user_id: number) {
    return await this.notificationReaderRepository.findAll({
      where: { user_id },
      include: { all: true },
    });
  }

  async remove(id: number) {
    await this.notificationReaderRepository.destroy({ where: { id } });
    return { message: 'Notification deleted' };
  }
}
