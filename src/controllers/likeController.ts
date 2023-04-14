import { NOT_FOUND } from './../constants';
import { NextFunction, Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import Like from '../models/Like';
import Post from '../models/Post';
import AppError from '../utils/AppError';

export const toggleLike = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return next(new AppError('', NOT_FOUND));
    }
    const user = req.user;
    const prevLike = await Like.findOne({
      user: user?.id,
      post: postId,
    });

    if (prevLike) {
      await Like.deleteOne({
        _id: prevLike.id,
      });
      post.likesNum--;
    } else {
      await Like.create({
        post: postId,
        user: user?.id,
      });
      post.likesNum++;
    }
    await post?.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
    });
  }
);