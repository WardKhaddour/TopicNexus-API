import { OK, SERVER_ERROR } from '../../constants';
import { Request, Response, NextFunction } from 'express';
import catchAsync from '../../utils/catchAsync';
import User from '../../models/User';
import Follow from '../../models/Follow';
import { ObjectId } from 'mongodb';
import AppError from '../../utils/AppError';

const getUserFollowers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.params.userId || !ObjectId.isValid(req.params.userId)) {
      return next(
        new AppError(req.i18n.t('userAuthMsg.serverError'), SERVER_ERROR)
      );
    }

    const followers = await Follow.aggregate([
      {
        $match: {
          following: new ObjectId(req.params.userId),
        },
      },
      {
        $lookup: {
          from: User.collection.name,
          foreignField: '_id',
          localField: 'follower',
          as: 'user',
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                bio: 1,
                photoSrc: 1,
              },
            },
            {
              $addFields: {
                photo: {
                  $concat: [
                    process.env.NODE_ENV === 'production'
                      ? process.env.PROD_URL
                      : process.env.DEV_URL,
                    '/images/users/',
                    '$photoSrc',
                  ],
                },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: Follow.collection.name,
          let: {
            userId: '$follower',
            followerId: new ObjectId(req.user?._id),
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$following', '$$userId'] },
                    { $eq: ['$follower', '$$followerId'] },
                  ],
                },
              },
            },
          ],
          as: 'follow',
        },
      },
      {
        $addFields: {
          isFollowing: {
            $cond: {
              if: { $gt: [{ $size: '$follow' }, 0] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          follow: 0,
        },
      },
      {
        $project: {
          user: 1,
          isFollowing: 1,
          follower: 1,
        },
      },
      {
        $unwind: '$user',
      },
    ]);

    res.status(OK).json({
      success: true,
      data: {
        followers,
      },
    });
  }
);

export default getUserFollowers;
