import { Request, Response, NextFunction } from 'express';
import { CelebrateError } from 'celebrate';

const errorHandler = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof SyntaxError && 'body' in error) {
    return res.status(400).send({ message: error.message });
  }

  if (error instanceof CelebrateError) {
    const message = error.details.get('body')?.details[0].message
      || 'Некорректные данные';
    return res.status(400).send({ message });
  }

  if (error.statusCode) {
    return res.status(error.statusCode).send({ message: error.message });
  }

  return res.status(500).send({ message: 'Внутренняя ошибка сервера' });
};

export default errorHandler;
