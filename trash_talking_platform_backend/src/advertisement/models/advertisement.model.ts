import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Table, Model, AllowNull } from 'sequelize-typescript';

interface AdvertisementAttrs {
  sponsor_name: string;
  email: string;
  phone_number: string;
  content: string;
  image?: string;
  start_date: string;
  end_date: string;
}

@Table({ tableName: 'Advertisement' })
export class Advertisement extends Model<Advertisement, AdvertisementAttrs> {
  @ApiProperty({ example: '1', description: 'Unikal ID' })
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({
    example: 'John Anderson',
    description: 'Sponsor`s name',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  sponsor_name: string;

  @ApiProperty({
    example: 'johnanderson@gmail.com',
    description: 'Sponsor`s email',
  })
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  email: string;

  @ApiProperty({
    example: '+998901234567',
    description: 'Sponsor`s phone number',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  phone_number: String;

  @ApiProperty({
    example: 'This is a sponsored advertisement about our new product launch.',
    description: 'The content of the advertisement',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  content: String;

  @ApiProperty({
    example: 'image.jpg',
    description: "Advertisement's image (optional field, not required)",
  })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  image?: string;

  @ApiProperty({
    example: '2025-02-15',
    description:
      'The start date of the advertisement in ISO 8601 format (YYYY-MM-DD)',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  start_date: String;

  @ApiProperty({
    example: '2025-03-15',
    description:
      'The end date of the advertisement in ISO 8601 format (YYYY-MM-DD)',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  end_date: String;
}
