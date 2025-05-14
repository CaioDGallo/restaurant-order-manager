import { Router } from 'express';
import MenuController from '../controllers/MenuController';

const router = Router();

router.post('/', MenuController.addItem);
router.get('/', MenuController.listItems);

export default router; 