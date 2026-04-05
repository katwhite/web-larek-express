import { createProduct, getProducts } from "../controllers/product";
import { Router } from "express";
import { validateCreateProductBody } from "../middlewares/validations";

const router = Router();

router.get('/', getProducts);
router.post('/', validateCreateProductBody, createProduct);

export default router;