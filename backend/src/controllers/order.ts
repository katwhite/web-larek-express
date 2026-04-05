import { Request, Response, NextFunction } from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  const {
    payment, email, phone, address, total, items,
  } = req.body;
  try {
    // Проверка наличия всех полей
    if (!payment || !email || !phone || !address || total === undefined || !items) {
      return next(new BadRequestError('Отсутствуют обязательные поля'));
    }

    // Проверка типов
    if (typeof total !== 'number') {
      return next(new BadRequestError('Поле total должно быть числом'));
    }

    if (!Array.isArray(items)) {
      return next(new BadRequestError('Items должен быть массивом'));
    }

    // Проверка payment enum
    if (payment !== 'card' && payment !== 'online') {
      return next(new BadRequestError('Поле payment должно быть "card" или "online"'));
    }

    // Проверка email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new BadRequestError('Некорректный формат email'));
    }

    // Проверка, что items не пустой и все ID валидны
    const validItems = items.filter((id) => id && typeof id === 'string' && id.length > 0);

    if (validItems.length === 0) {
      return next(new BadRequestError('Items должен содержать хотя бы один валидный ID товара'));
    }

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
