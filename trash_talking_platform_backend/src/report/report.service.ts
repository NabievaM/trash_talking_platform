import {
  Injectable,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { User } from '../user/models/user.model';
import { InjectModel } from '@nestjs/sequelize';
import { Report } from './models/report.model';
import { NotificationGateway } from '../notification/notification.gateway';
import { Op } from 'sequelize';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Report) private reportRepository: typeof Report,
    @Inject(forwardRef(() => NotificationGateway))
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async create(createReportDto: CreateReportDto): Promise<Report> {
    const report = await this.reportRepository.create(createReportDto);
  
    const fullReport = await this.reportRepository.findOne({
      where: { id: report.id },
      include: [
        { model: User, as: 'reporter', attributes: ['username'] },
      ],
    });
  
    if (createReportDto.reported_user && fullReport?.reporter) {
      const message = `${fullReport.reporter.username} has filed a complaint against you.`;
      await this.notificationGateway.sendReportNotification(
        createReportDto.reported_user,
        message,
      );
    }
  
    return report;
  }

  async findAll(): Promise<Report[]> {
    return await this.reportRepository.findAll({ include: { all: true } });
  }

  async search({ reported_by, reported_user }) {
    const where = {};

    const include = [
      {
        model: User,
        as: 'reporter',
        attributes: ['id', 'email'],
        where: reported_by
          ? { email: { [Op.iLike]: `%${reported_by}%` } }
          : undefined,
      },
      {
        model: User,
        as: 'reported',
        attributes: ['id', 'email'],
        where: reported_user
          ? { email: { [Op.iLike]: `%${reported_user}%` } }
          : undefined,
      },
    ].filter((inc) => inc.where);

    const reports = await Report.findAll({ where, include });

    if (!reports.length) {
      throw new BadRequestException('No reports found');
    }
    return reports;
  }

  async getById(id: number): Promise<Report | null> {
    const report = await this.reportRepository.findOne({
      where: { id },
      include: { all: true },
    });

    return report ? report.toJSON() : null;
  }

  async deleteById(id: number): Promise<number> {
    return await this.reportRepository.destroy({ where: { id } });
  }

  async updateById(
    id: number,
    updateReportDto: UpdateReportDto,
  ): Promise<Report> {
    const report = await this.reportRepository.update(updateReportDto, {
      where: { id },
      returning: true,
    });

    return report[1][0];
  }
}
