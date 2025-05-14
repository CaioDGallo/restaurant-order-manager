import { Router } from 'express';
import OrderController from '../controllers/OrderController';

const router = Router();

router.post('/', OrderController.create);
router.patch('/modify/:order_id', OrderController.modify);
router.patch('/:order_id', OrderController.updateStatus);

export default router; 