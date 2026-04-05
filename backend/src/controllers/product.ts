import { Request, Response, NextFunction } from 'express';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Product.find({})
    .then((products) => res.send({ items: products, total: products.length }))
    .catch(() => next(new Error('Произошла ошибка')));
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, image, category, description, price } = req.body;

    // Валидация обязательных полей
    if (!title || !image || !category) {
      return next(new BadRequestError('Отсутствуют обязательные поля: title, image, category'));
    }

    // Валидация image структуры
    if (!image.fileName || !image.originalName) {
      return next(new BadRequestError('Поле image должно содержать fileName и originalName'));
    }

    // Валидация длины title
    if (title.length < 2 || title.length > 30) {
      return next(new BadRequestError('Длина поля title должна быть от 2 до 30 символов'));
    }

    const product = await Product.create({
      title,
      image,
      category,
      description,
      price
    });

    return res.status(201).send({ data: product });

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
    next(error);
  }
};