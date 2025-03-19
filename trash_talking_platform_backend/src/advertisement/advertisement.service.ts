import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { UpdateAdvertisementDto } from './dto/update-advertisement.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Advertisement } from './models/advertisement.model';
import { FilesService } from '../files/files.service';
import { Op } from 'sequelize';
import { NotificationGateway } from '../notification/notification.gateway';

@Injectable()
export class AdvertisementService {
  constructor(
    @InjectModel(Advertisement)
    private AdvertisementRepository: typeof Advertisement,
    private readonly fileService: FilesService,
    @Inject(NotificationGateway)
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async create(createAdvertisementDto: CreateAdvertisementDto, image?: any) {
    const Advertisement = await this.AdvertisementRepository.findOne({
      where: { email: createAdvertisementDto.email },
    });
    if (Advertisement) {
      throw new BadRequestException('Email already exists!');
    }

    let fileName = null;

    if (image) {
      fileName = await this.fileService.createFile(image);
    }

    const advertisement = await this.AdvertisementRepository.create({
      ...createAdvertisementDto,
      image: fileName,
    });

    this.notificationGateway.sendNewAdvertisement(advertisement);

    return advertisement;
  }

  async findAll(): Promise<Advertisement[]> {
    return this.AdvertisementRepository.findAll({ include: { all: true } });
  }

  async GetById(id: number): Promise<Advertisement> {
    const Advertisement = await this.AdvertisementRepository.findByPk(id, {
      include: { all: true },
    });
    return Advertisement;
  }

  async deleteById(id: number): Promise<number> {
    const Advertisement = await this.AdvertisementRepository.destroy({
      where: { id },
    });
    return Advertisement;
  }

  async updateById(
    id: number,
    updateAdvertisementDto: UpdateAdvertisementDto,
  ): Promise<Advertisement> {
    const [affectedRows, [updatedAdvertisement]] =
      await this.AdvertisementRepository.update(updateAdvertisementDto, {
        where: { id },
        returning: true,
      });

    if (!affectedRows || !updatedAdvertisement) {
      throw new NotFoundException('Advertisement not found');
    }

    return updatedAdvertisement;
  }

  async removeFile(id: number) {
    const Advertisement = await this.AdvertisementRepository.findOne({
      where: { id },
    });

    if (!Advertisement) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    return this.fileService.removeFile(Advertisement.image);
  }

  async updateImage(id: number, image: any) {
    const advertisement = await this.AdvertisementRepository.findOne({
      where: { id },
    });

    if (!advertisement) {
      throw new HttpException('Advertisement not found', HttpStatus.NOT_FOUND);
    }

    if (advertisement.image) {
      const removeFile = await this.removeFile(id);
      if (!removeFile) {
        throw new BadRequestException('Image could not be removed');
      }
    }

    const createFile = await this.fileService.createFile(image);
    const [affectedCount, affectedRows] =
      await this.AdvertisementRepository.update(
        { image: createFile },
        { where: { id }, returning: true },
      );

    if (!affectedCount) {
      throw new BadRequestException('Advertisement not found or not updated');
    }

    return affectedRows[0];
  }

  async remove(id: number) {
    const advertisement = await this.AdvertisementRepository.findOne({
      where: { id },
    });

    if (!advertisement) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    return this.fileService.removeFile(advertisement.image);
  }

  async search({ sponsor_name }) {
    const where = {};

    if (sponsor_name) {
      where['sponsor_name'] = {
        [Op.iLike]: `%${sponsor_name}%`,
      };
    }
    const advertisement = await Advertisement.findAll({ where });
    if (!advertisement) {
      throw new BadRequestException('advertisement not found');
    }
    return advertisement;
  }
}
