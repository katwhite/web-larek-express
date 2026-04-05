import { createOrder } from "../controllers/order";
import { Router } from "express";
import { validateOrderBody } from "../middlewares/validations";

const router = Router();

router.post('/', validateOrderBody, createOrder);

export default router;