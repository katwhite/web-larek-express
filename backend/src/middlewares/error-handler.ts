import { Request, Response, NextFunction } from 'express';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import InternalServerError from '../errors/internal-server-error';
import NotFoundError from '../errors/not-found-error';

const errorHandler = (
  err: Error,
  _: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof BadRequestError
      || err instanceof ConflictError
      || err instanceof InternalServerError
      || err instanceof NotFoundError) {
    const statusCode = (err as any).statusCode || 500;
    const { message } = err;

    return res.status(statusCode).json({ message });
  }

  // Если ошибка валидации от celebrate
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Ошибка валидации данных',
    });
  }

  // Обработка ошибки дубликата ключа MongoDB
  if (err.message && err.message.includes('E11000')) {
    return res.status(409).json({
      message: 'Товар с таким заголовком уже существует',
    });
  }

  // Все остальные ошибки по умолчанию
  console.error('Непредвиденная ошибка:', err);
  return res.status(500).json({
    message: 'На сервере произошла ошибка',
  });
};

export default errorHandler;
