import {
  HttpException,
  HttpStatus,
  Injectable,
  Inject,
  forwardRef,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Posts } from './models/post.model';
import { FilesService } from '../files/files.service';
import { Op } from 'sequelize';
import { NotificationService } from '../notification/notification.service';
import { Notification } from '../notification/models/notification.model';
import { NotificationGateway } from '../notification/notification.gateway';
import { UserService } from '../user/user.service';
import { FollowService } from '../follow/follow.service';
import { NotificationReader } from '../notification-readers/models/notification-reader.model';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Posts) private PostRepository: typeof Posts,
    private readonly fileService: FilesService,

    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,

    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,

    @Inject(forwardRef(() => FollowService))
    private readonly followService: FollowService,

    @Inject(NotificationGateway)
    private readonly notificationGateway: NotificationGateway,

    @InjectModel(NotificationReader)
    private readonly notificationReaderRepository: typeof NotificationReader,

    @InjectModel(Notification)
    private readonly notificationRepository: typeof Notification,
  ) {}

  async create(createPostDto, image, userId) {
    const fileName = await this.fileService.createFile(image);
    const post = await this.PostRepository.create({
      ...createPostDto,
      image: fileName,
      user_id: userId,
    });

    const user = await this.userService.findOne(userId);
    const followers = await this.followService.getFollowers(userId, userId);

    if (followers.length) {
      const message = `${user.username} has posted a new post!`;

      const notification = await this.notificationRepository.create({
        message,
      });

      const readers = followers.map((follower) => ({
        notification_id: notification.id,
        user_id: follower.follower.id,
        is_read: false,
      }));

      await this.notificationReaderRepository.bulkCreate(readers);

      this.notificationGateway.sendNewPostToFollowers(
        followers.map((f) => f.follower.id),
        {
          id: post.id,
          title: post.title,
          image: post.image,
          author: user.username,
        },
      );
    }

    return post;
  }

  async findAll(userId: number, isAdmin: boolean): Promise<any[]> {
    const posts = await this.PostRepository.findAll({
      include: [
        {
          association: 'user',
          attributes: [
            'id',
            'username',
            'profile_picture',
            'profile_visibility',
          ],
          include: [{ association: 'followers' }],
        },
        {
          association: 'comments',
          include: [
            {
              association: 'user',
              attributes: ['id', 'username', 'profile_picture'],
            },
          ],
        },
        {
          association: 'likes',
          include: [
            {
              association: 'user',
              attributes: ['id', 'username'],
            },
          ],
        },
        {
          association: 'category',
          attributes: ['id', 'name'],
        },
      ],
    });

    return posts
      .filter((post) => {
        if (!post.user) return false;
        if (isAdmin) return true;
        if (post.user.profile_visibility === 'public') return true;
        if (post.user_id === userId) return true;
        if (
          post.user.followers?.some(
            (sub) => sub.follower_id === userId && sub.status === 'accepted',
          )
        )
          return true;
        return false;
      })
      .map((post) => ({
        ...post.toJSON(),
        commentsCount: post.comments?.length || 0,
        likesCount: post.likes?.length || 0,
      }));
  }

  async myPosts(userId: number): Promise<Posts[]> {
    const posts = await this.PostRepository.findAll({
      where: { user_id: userId },
    });

    if (!posts || posts.length === 0) {
      throw new NotFoundException("You haven't created any posts yet.");
    }

    return posts;
  }

  async GetById(id: number, userId: number): Promise<Posts> {
    const post = await this.PostRepository.findByPk(id, {
      include: [
        { association: 'user', include: [{ association: 'followers' }] },
      ],
    });

    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    if (!post.user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (
      post.user.profile_visibility === 'public' ||
      post.user_id === userId ||
      post.user.followers?.some(
        (sub) => sub.follower_id === userId && sub.status === 'accepted',
      )
    ) {
      return post;
    }

    throw new HttpException(
      'You do not have permission to view this post. You are not an accepted follower of this user.',
      HttpStatus.FORBIDDEN,
    );
  }

  async deleteById(id: number) {
    const post = await this.PostRepository.findOne({ where: { id } });
    if (!post) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    await this.fileService.removeFile(post.image);
    await this.PostRepository.destroy({ where: { id } });

    return { success: true, message: 'Post deleted successfully' };
  }

  async updateById(id: number, updatePostDto: UpdatePostDto): Promise<Posts> {
    const [count, updatedPosts] = await this.PostRepository.update(
      updatePostDto,
      {
        where: { id },
        returning: true,
      },
    );
    if (count === 0) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    return updatedPosts[0];
  }

  async removeFile(id: number) {
    const post = await this.PostRepository.findOne({ where: { id } });
    if (!post) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }
    return this.fileService.removeFile(post.image);
  }

  async updateImage(id: number, image: any) {
    await this.removeFile(id);
    const fileName = await this.fileService.createFile(image);
    const [_, updatedPosts] = await this.PostRepository.update(
      { image: fileName },
      { where: { id }, returning: true },
    );
    return updatedPosts[0];
  }

  async search({ title }, userId: number) {
    const where: any = title ? { title: { [Op.iLike]: `%${title}%` } } : {};
    const posts = await this.PostRepository.findAll({
      where,
      include: [
        { association: 'user', include: [{ association: 'followers' }] },
      ],
    });

    return posts.filter((post) => {
      if (!post.user) return false;
      if (post.user.profile_visibility === 'public') return true;
      if (post.user_id === userId) return true;
      if (
        post.user.followers?.some(
          (sub) => sub.follower_id === userId && sub.status === 'accepted',
        )
      )
        return true;
      return false;
    });
  }
}
