import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Like } from './models/like.model';
import { Posts } from '../post/models/post.model';
import { Comment } from '../comment/models/comment.model';
import { User } from '../user/models/user.model';
import { NotificationGateway } from '../notification/notification.gateway';

@Injectable()
export class LikeService {
  constructor(
    @InjectModel(Like) private LikeRepository: typeof Like,
    @InjectModel(Posts) private PostRepository: typeof Posts,
    @InjectModel(Comment) private CommentRepository: typeof Comment,
    @InjectModel(User) private UserRepository: typeof User,
    @Inject(NotificationGateway)
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async create(createLikeDto: CreateLikeDto, userId: number) {
    const { post_id, comment_id } = createLikeDto;

    if (!post_id && !comment_id) {
      throw new BadRequestException(
        'Either post_id or comment_id must be provided.',
      );
    }

    if (post_id && comment_id) {
      throw new BadRequestException(
        'Only one of post_id or comment_id can be provided.',
      );
    }

    const existingLike = await this.LikeRepository.findOne({
      where: {
        user_id: userId,
        post_id: post_id || null,
        comment_id: comment_id || null,
      },
    });

    if (existingLike) {
      throw new ConflictException('You already liked it.');
    }

    const user = await this.UserRepository.findByPk(userId);
    if (!user) throw new NotFoundException('User not found.');

    let ownerId: number;
    let message: string;

    if (post_id) {
      const post = await this.PostRepository.findByPk(post_id, {
        include: [
          { association: 'user', include: [{ association: 'followers' }] },
        ],
      });

      if (!post) throw new NotFoundException('Post not found.');

      if (
        post.user.profile_visibility === 'private' &&
        post.user_id !== userId &&
        !post.user.followers?.some(
          (sub) => sub.follower_id === userId && sub.status === 'accepted',
        )
      ) {
        throw new ForbiddenException(
          'You do not have permission to like this post.',
        );
      }

      ownerId = post.user.id;
      message = `${post.user.username}, ${user.username} liked your post!`;
    }

    if (comment_id) {
      const comment = await this.CommentRepository.findByPk(comment_id, {
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

      if (!comment) throw new NotFoundException('Comment not found.');

      const post = comment.post;

      if (!post)
        throw new NotFoundException('Post related to this comment not found.');

      if (
        post.user.profile_visibility === 'private' &&
        post.user_id !== userId &&
        !post.user.followers?.some(
          (sub) => sub.follower_id === userId && sub.status === 'accepted',
        )
      ) {
        throw new ForbiddenException(
          'You do not have permission to like this comment.',
        );
      }

      ownerId = comment.user.id;
      message = `${comment.user.username}, ${user.username} liked your comment!`;
    }

    const like = await this.LikeRepository.create({
      ...createLikeDto,
      user_id: userId,
    });

    if (ownerId && message) {
      this.notificationGateway.sendLikeNotification(ownerId, message);
    }

    return like;
  }

  async findAll(userId: number): Promise<Like[]> {
    const user = await this.UserRepository.findByPk(userId);
    if (!user) throw new NotFoundException('User not found.');
    const likes = await this.LikeRepository.findAll({
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

    if (user.is_admin) return likes;

    return likes.filter((like) => {
      const post = like.post;
      if (!post) return false;
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

  async getById(id: number, userId: number): Promise<Like> {
    const like = await this.LikeRepository.findByPk(id, {
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

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    if (!like.post || !like.post.user) {
      throw new NotFoundException('Related post or user not found.');
    }

    const post = like.post;

    if (
      post.user.profile_visibility === 'public' ||
      post.user_id === userId ||
      post.user.followers?.some(
        (sub) => sub.follower_id === userId && sub.status === 'accepted',
      )
    ) {
      return like;
    }

    throw new ForbiddenException(
      'You do not have permission to view this like.',
    );
  }

  async deleteById(id: number, userId: number): Promise<number> {
    const like = await this.LikeRepository.findByPk(id);
    if (!like) {
      throw new BadRequestException('Like not found.');
    }

    if (like.user_id !== userId) {
      throw new ForbiddenException(
        'Access denied: You do not have permission to delete this like.',
      );
    }

    return this.LikeRepository.destroy({ where: { id } });
  }
}
