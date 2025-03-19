import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEmail,
  IsString,
  IsStrongPassword,
  IsEnum,
  IsInt,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum Profession {
  SPORTIFS = 'sportifs',
  ARTISTES = 'artistes',
  POLITIQUES = 'politiques',
  PERSONNES = 'personnes',
}

export enum ProfileVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export class SignUpUserDto {
  @ApiProperty({ example: 'Mukhlis', description: 'User`s name' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'nabieva@gmail.com', description: 'User`s email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Uzbek1$t0n', description: 'User`s password' })
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @ApiProperty({ example: 'Full stack developer', description: 'User`s bio' })
  @IsString()
  @IsOptional()
  bio: string;

  @ApiProperty({ example: 25, description: 'User`s age' })
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @IsOptional()
  age: number;

  @ApiProperty({
    example: 'https://instagram.com/john777',
    description: 'User`s instagram link',
  })
  @IsString()
  @IsOptional()
  instagram: string;

  @ApiProperty({
    example: 'https://facebook.com/john.doe',
    description: 'User`s facebook link',
  })
  @IsString()
  @IsOptional()
  facebook: string;

  @ApiProperty({
    example: 'sportifs',
    description: 'User`s profession',
    enum: Profession,
  })
  @IsEnum(Profession)
  @IsNotEmpty()
  profession?: Profession;

  @ApiProperty({
    example: 'public',
    description: 'Profile visibility',
    enum: ProfileVisibility,
  })
  @IsNotEmpty()
  @IsEnum(ProfileVisibility)
  profile_visibility: ProfileVisibility;

  @ApiProperty({ example: false, description: 'User is super admin?' })
  @Transform(({ value }) => (value === 'true' ? true : false))
  @IsBoolean()
  @IsOptional()
  is_superAdmin: boolean;

  @ApiProperty({ example: false, description: 'User is admin?' })
  @Transform(({ value }) => (value === 'true' ? true : false))
  @IsBoolean()
  @IsOptional()
  is_admin: boolean;

  @ApiProperty({ example: true, description: 'User`s activity' })
  @Transform(({ value }) => (value === 'true' ? true : false))
  @IsBoolean()
  @IsOptional()
  is_active: boolean;
}
