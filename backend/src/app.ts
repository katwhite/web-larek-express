import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import orderRouter from './routes/order';
import productRouter from './routes/product';
import errorHandler from './middlewares/error-handler';
import { isCelebrateError } from 'celebrate';
import { requestLogger, errorLogger } from './middlewares/logger';
import { PORT, DB_ADDRESS } from './config';

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(DB_ADDRESS)
  .then(() => console.log('Успешное подключение к бд'))
  .catch((err) => console.error('Ошибка при подключении к бд:', err));

app.use(requestLogger);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/product', productRouter);
app.use('/order', orderRouter);

app.use(errorHandler);

// Обработка несуществующих маршрутов
app.use('*', (req, res, next) => {
  const NotFoundError = require('./errors/not-found-error').default;
  next(new NotFoundError());
});

app.use(errorLogger);

app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  if (isCelebrateError(err)) {
    const celebrateError = err as any;
    let message = 'Ошибка валидации данных';

    const errorDetails = celebrateError.details.get('body')
      || celebrateError.details.get('params')
      || celebrateError.details.get('query');

    if (errorDetails && errorDetails.details.length > 0) {
      const firstError = errorDetails.details[0];
      if (firstError.message) {
        message = firstError.message;
      }
    }

    return res.status(400).json({ message });
  }
  return next(err);
});
app.use(errorHandler);

app.listen(PORT, () => {console.log(`listening on ${PORT}`)});