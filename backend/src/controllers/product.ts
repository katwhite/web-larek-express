import { Request, Response, NextFunction } from 'express';
import { Error } from 'mongoose';
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
) => Product.create(req.body)
  .then((product) => res.status(201).send(product))
  .catch((error: Error) => {
    if (error instanceof Error.ValidationError) {
      return next(new BadRequestError(error.message));
    }
    if (error.message.includes('E11000') && error.message.includes('title')) {
      return next(
        new ConflictError('Товар с таким заголовком уже существует'),
      );
    }
    return next(error);
  });
