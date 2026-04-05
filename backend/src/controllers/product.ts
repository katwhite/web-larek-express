import { Request, Response, NextFunction } from 'express';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';

export const getProducts = async (
  _: Request,
  res: Response,
  next: NextFunction,
) => {
  Product.find({})
    .then((products) => res.send({ items: products, total: products.length }))
    .catch(() => next(new Error('Произошла ошибка')));
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const product = await Product.create(req.body);
    return res.status(201).send({ data: product.toJSON() });
  } catch (error) {
    // Обработка ошибки дубликата title
    if (error instanceof Error && error.message.includes('E11000')) {
      return next(new ConflictError('Товар с таким заголовком уже существует'));
    }

    // Обработка ошибки валидации Mongoose
    if (error instanceof Error && error.name === 'ValidationError') {
      return next(new BadRequestError('Ошибка валидации данных при создании товара'));
    }

    // Все остальные ошибки
    return next(error);
  }
};
