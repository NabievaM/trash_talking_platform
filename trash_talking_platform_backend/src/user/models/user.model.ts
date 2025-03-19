import { ApiProperty } from '@nestjs/swagger';
import {
  Table,
  Model,
  Column,
  DataType,
  HasMany,
  HasOne,
} from 'sequelize-typescript';
import { Posts } from '../../post/models/post.model';
import { Comment } from '../../comment/models/comment.model';
import { Like } from '../../like/models/like.model';
import { Challenge } from '../../challenge/models/challenge.model';
import { Report } from '../../report/models/report.model';
import { Subscription } from '../../subscription/models/subscription.model';
import { Follow } from '../../follow/models/follow.model';
import { ProfileVisibility } from '../dto/signup-user.dto';
import { ChallengeEntry } from '../../challenge-entry/models/challenge-entry.model';
import { Vote } from '../../vote/models/vote.model';
import { Notification } from '../../notification/models/notification.model';
import { NotificationReader } from '../../notification-readers/models/notification-reader.model';
import { Stream } from '../../stream/models/stream.model';

enum Profession {
  SPORTIFS = 'sportifs',
  ARTISTES = 'artistes',
  POLITIQUES = 'politiques',
  PERSONNES = 'personnes',
}

interface UserAttrs {
  username: string;
  email: string;
  password: string;
  profile_picture?: string;
  bio?: string;
  age?: number;
  instagram?: string;
  facebook?: string;
  is_active?: boolean;
  is_admin?: boolean;
  is_superAdmin?: boolean;
  profile_visibility?: ProfileVisibility;
  profession?: Profession;
}

@Table({ tableName: 'users' })
export class User extends Model<User, UserAttrs> {
  @ApiProperty({ example: 1, description: 'Unique ID' })
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: 'Mukhlis', description: "User's name" })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  username: string;

  @ApiProperty({ example: 'nabieva@gmail.com', description: "User's email" })
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  email: string;

  @ApiProperty({ example: 'Uzbek!$t0n', description: "User's password" })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password: string;

  @ApiProperty({
    example: 'image.jpg',
    description: "User's profile picture (optional field, not required)",
  })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  profile_picture?: string;

  @ApiProperty({ example: 'Full stack developer', description: "User's bio" })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  bio?: string;

  @ApiProperty({ example: 25, description: "User's age" })
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  age?: number;

  @ApiProperty({
    example: 'https://instagram.com/john777',
    description: "User's instagram link",
  })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  instagram?: string;

  @ApiProperty({
    example: 'https://facebook.com/john.doe',
    description: "User's facebook link",
  })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  facebook?: string;

  @ApiProperty({
    example: 'sportifs',
    description: 'User profession type',
    enum: Profession,
  })
  @Column({
    type: DataType.ENUM(...Object.values(Profession)),
    allowNull: false,
  })
  profession?: Profession;

  @ApiProperty({
    example: 'public',
    description: 'Profile visibility',
    enum: ProfileVisibility,
  })
  @Column({
    type: DataType.ENUM(...Object.values(ProfileVisibility)),
    allowNull: false,
    defaultValue: ProfileVisibility.PUBLIC,
  })
  profile_visibility: ProfileVisibility;

  @ApiProperty({ example: true, description: "User's activity status" })
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  is_active?: boolean;

  @ApiProperty({
    example: false,
    description: 'Is the user an admin?',
  })
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: true,
  })
  is_admin?: boolean;

  @ApiProperty({
    example: false,
    description: 'Is the user an super admin?',
  })
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: true,
  })
  is_superAdmin?: boolean;

  @ApiProperty({
    example: 'dsf7787cvnc9s_kjsjfndf7',
    description: "User's hashed refresh token",
  })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  hashed_refresh_token: string;

  @HasMany(() => Posts)
  posts: Posts[];

  @HasMany(() => Comment)
  comments: Comment[];

  @HasMany(() => Like)
  likes: Like[];

  @HasMany(() => Challenge)
  challenges: Challenge[];

  @HasMany(() => Report, { foreignKey: 'reported_by', as: 'sent_reports' })
  sent_reports: Report[];

  @HasMany(() => Report, {
    foreignKey: 'reported_user',
    as: 'received_reports',
  })
  received_reports: Report[];

  @HasMany(() => Subscription)
  subscriptions: Subscription[];

  @HasMany(() => Follow, { foreignKey: 'follower_id', as: 'following' })
  following!: Follow[];

  @HasMany(() => Follow, { foreignKey: 'following_id', as: 'followers' })
  followers!: Follow[];

  @HasMany(() => ChallengeEntry)
  challengeEntries: ChallengeEntry[];

  @HasMany(() => Vote)
  votes: Vote[];

  @HasMany(() => Notification)
  notifications: Notification[];

  @HasMany(() => NotificationReader)
  notificationReaders: NotificationReader[];

  @HasOne(() => Stream, 'streamer_id')
  stream: Stream;
}
