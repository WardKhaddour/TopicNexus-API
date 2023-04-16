import { NOT_FOUND, BAD_REQUEST } from './../../constants';
import { Request, Response, NextFunction, query } from 'express';

import User from '../../models/User';
import Follow from '../../models/Follow';
import { OK } from '../../constants';
import AppError from '../../utils/AppError';

const toggleFollowUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user!;
  const { userId: userToFollowId } = req.params;

  if (user._id.equals(userToFollowId)) {
    return next(new AppError('You cannot follow your self', BAD_REQUEST));
  }
  User.findById(userToFollowId);

  const [isFollowing, userToFollow] = await Promise.all([
    Follow.findOne({
      follower: user._id,
      following: userToFollowId,
    }),
    User.findById(userToFollowId),
  ]);

  if (!userToFollow) {
    return next(new AppError('User Not Fount', NOT_FOUND));
  }

  if (isFollowing) {
    user.followingNum--;
    userToFollow.followersNum--;
    const [, updatedUser, updatedUserToFollow] = await Promise.all([
      isFollowing.deleteOne(),
      user.save(),
      userToFollow.save(),
    ]);
    return res.status(OK).json({
      success: true,
      message: `Un followed ${userToFollow.name} successfully`,
      data: {
        userToFollow: {
          followers: userToFollow.followersNum,
        },
        user: {
          following: user.followingNum,
        },
      },
    });
  }

  user.followingNum++;
  userToFollow.followersNum++;
  const [, updatedUser, updatedUserToFollow] = await Promise.all([
    Follow.create({ follower: user._id, following: userToFollowId }),
    user.save(),
    userToFollow.save(),
  ]);
  return res.status(OK).json({
    success: true,
    message: `Followed ${userToFollow.name} successfully`,
    data: {
      userToFollow: {
        followers: userToFollow.followersNum,
      },
      user: {
        following: user.followingNum,
      },
    },
  });
};
export default toggleFollowUser;
