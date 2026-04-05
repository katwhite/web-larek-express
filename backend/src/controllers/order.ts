import { Request, Response, NextFunction } from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      payment, email, phone, address, total, items,
    } = req.body;

    // Проверка обязательных полей
    if (!payment || !email || !phone || !address || !total || !items) {
      return next(new BadRequestError('Отсутствуют обязательные поля'));
    }

    // Проверка payment
    if (payment !== 'card' && payment !== 'online') {
      return next(new BadRequestError('Поле payment должно быть "card" или "online"'));
    }

    // Проверка email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return next(new BadRequestError('Некорректный формат email'));
    }

    // Проверка items
    if (!Array.isArray(items) || items.length === 0) {
      return next(new BadRequestError('Items должен быть непустым массивом'));
    }

    // Получение товаров из бд
    const products = await Product.find({
      _id: { $in: items },
    });

    if (products.length !== items.length) {
      return next(new BadRequestError('Один или несколько товаров не найдены'));
    }

    // Проверка total
    const calculatedTotal = products.reduce((sum, product) => sum + (product.price || 0), 0);

    if (calculatedTotal !== total) {
      return next(new BadRequestError('Сумма заказа не соответствует стоимости товаров'));
    }

    // Генерация id заказа
    const orderId = faker.string.uuid();

    return res.status(201).send({
      id: orderId,
      total,
    });
  } catch (error) {
    console.error('Ошибка при создании заказа:', error);
    return res.status(500).send({
      message: 'Произошла ошибка при создании заказа',
    });
  }
};

export default createOrder;
