import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { errors } from 'celebrate';
import { orderRouter, productRouter } from './routes';
import errorHandler from './middlewares/error-handler';
import { requestLogger, errorLogger } from './middlewares/logger';
import { PORT, DB_ADDRESS } from './config';

const app = express();

mongoose
  .connect(DB_ADDRESS)
  .then(() => console.log('Успешное подключение к бд'))
  .catch((err) => console.error('Ошибка при подключении к бд:', err));

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use('/product', productRouter);
app.use('/order', orderRouter);

app.use(errorLogger);

app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => { console.log(`listening on ${PORT}`); });
