import { BAD_REQUEST, NOT_FOUND } from './../../constants';
import { Request, Response, NextFunction } from 'express';

import catchAsync from '../../utils/catchAsync';
import Category from '../../models/Category';
import { CREATED, DELETED, OK } from '../../constants';
import AppError from '../../utils/AppError';

export const getAllCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const categories = await Category.find().select('-__v');

    res.status(OK).json({
      success: true,
      data: categories,
    });
  }
);

export const addNewCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.body;

    const foundedCategory = await Category.findOne({
      name,
    });

    if (foundedCategory) {
      return next(new AppError('Category already exists', BAD_REQUEST));
    }

    const category = await Category.create({
      name,
    });

    res.status(CREATED).json({
      success: true,
      message: 'Category Added Successfully',
      data: {
        category: {
          name: category?.name,
        },
      },
    });
  }
);

export const updateCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;
    const { name } = req.body;
    const category = await Category.findById(categoryId);

    if (!category) {
      return next(new AppError('No Category Found!', NOT_FOUND));
    }

    if (category.name === name) {
      return next(new AppError('Category already exists', BAD_REQUEST));
    }

    category.name = name;
    await category.save();

    res.status(OK).json({
      success: true,
      message: 'Category Updated Successfully',
      data: {
        category: {
          name: category?.name,
        },
      },
    });
  }
);

export const deleteCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { categoryId } = req.params;
    await Category.findByIdAndDelete(categoryId);

    res.status(DELETED).json({
      success: true,
    });
  }
);
