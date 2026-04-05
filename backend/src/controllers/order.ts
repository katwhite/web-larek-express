import { Request, Response, NextFunction } from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  const {
    total, items,
  } = req.body;
  try {
    // Получение товаров из бд
    const products = await Product.find({
      _id: { $in: items },
    });

    if (products.filter((item) => item.price || item.price === 0).length !== items.length) {
      return next(new BadRequestError('Один или несколько товаров не найдены или не продаются'));
    }

    // Проверка total
    const calculatedTotal = products.reduce((sum, product) => sum + product.price!, 0);
    if (calculatedTotal !== total) {
      return next(new BadRequestError('Сумма заказа не соответствует стоимости товаров'));
    }
  } catch (error) {
    return next(error);
  }

  // Генерация id заказа
  const orderId = faker.string.uuid();

  return res.status(200).send({
    id: orderId,
    total,
  });
};

export default createOrder;
