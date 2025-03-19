import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Comment } from './models/comment.model';
import { NotificationGateway } from '../notification/notification.gateway';
import { Posts } from '../post/models/post.model';
import { User } from '../user/models/user.model';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment) private CommentRepository: typeof Comment,
    @InjectModel(Posts) private PostRepository: typeof Posts,
    @InjectModel(User) private UserRepository: typeof User,
    @Inject(NotificationGateway)
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async create(createCommentDto, userId: number) {
    const user = await this.UserRepository.findByPk(userId);
    if (!user) throw new NotFoundException('User not found.');

    const post = await this.PostRepository.findByPk(createCommentDto.post_id, {
      include: [
        { association: 'user', include: [{ association: 'followers' }] },
      ],
    });

    if (!post) {
      throw new BadRequestException('Post not found.');
    }

    if (
      post.user.profile_visibility === 'private' &&
      post.user_id !== userId &&
      !post.user.followers?.some(
        (sub) => sub.follower_id === userId && sub.status === 'accepted',
      )
    ) {
      throw new ForbiddenException(
        'You do not have permission to comment on this post.',
      );
    }

    const comment = await this.CommentRepository.create({
      ...createCommentDto,
      user_id: userId,
    });

    if (post && post.user) {
      const message = `${post.user.username}, ${user.username} commented on your post!`;

      this.notificationGateway.sendNewCommentNotification(
        post.user.id,
        message,
      );
    }

    return comment;
  }

  async findAll(userId: number): Promise<Comment[]> {
    const user = await this.UserRepository.findByPk(userId);
    if (!user) throw new NotFoundException('User not found.');

    const comments = await this.CommentRepository.findAll({
      include: [
        { association: 'user' },
        {
          association: 'post',
          include: [
            { association: 'user', include: [{ association: 'followers' }] },
          ],
        },
      ],
    });

    if (user.is_admin) return comments;

    return comments.filter((comment) => {
      const post = comment.post;
      return (
        post &&
        (post.user.profile_visibility === 'public' ||
          post.user_id === userId ||
          post.user.followers?.some(
            (f) => f.follower_id === userId && f.status === 'accepted',
          ))
      );
    });
  }

  async findById(id: number, userId: number): Promise<Comment> {
    const comment = await this.CommentRepository.findByPk(id, {
      include: [
        { association: 'user' },
        {
          association: 'post',
          include: [
            { association: 'user', include: [{ association: 'followers' }] },
          ],
        },
      ],
    });

    if (!comment) throw new NotFoundException('Comment not found');

    const post = comment.post;
    if (
      post.user.profile_visibility === 'public' ||
      post.user_id === userId ||
      post.user.followers?.some(
        (f) => f.follower_id === userId && f.status === 'accepted',
      )
    ) {
      return comment;
    }

    throw new ForbiddenException(
      'You do not have permission to view this comment.',
    );
  }

  async deleteById(id: number, userId: number): Promise<void> {
    const user = await this.UserRepository.findByPk(userId);
    if (!user) throw new NotFoundException('User not found.');

    const comment = await this.CommentRepository.findByPk(id);
    if (!comment) throw new BadRequestException('Comment not found.');

    if (!user.is_admin && comment.user_id !== userId) {
      throw new ForbiddenException(
        'Access denied: You do not have permission to delete this comment.',
      );
    }

    await this.CommentRepository.destroy({ where: { id } });
  }

  async updateById(
    id: number,
    updateCommentDto: UpdateCommentDto,
    userId: number,
  ): Promise<Comment> {
    const comment = await this.CommentRepository.findByPk(id);
    if (!comment) throw new NotFoundException('Comment not found');

    if (comment.user_id !== userId) {
      throw new ForbiddenException(
        'Access denied: You do not have permission to edit this comment.',
      );
    }

    await comment.update(updateCommentDto);
    return comment.reload();
  }
}
