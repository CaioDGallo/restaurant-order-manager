import { Router } from 'express';
import CustomerController from '../controllers/CustomerController';

const router = Router();

router.post('/', CustomerController.registerCustomer);
router.get('/orders/:customerId', CustomerController.getOrdersByCustomer);

export default router; 
