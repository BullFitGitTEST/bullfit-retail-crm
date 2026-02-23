import { Router } from 'express';
import {
  getOrders,
  getOrderById,
  getOrdersByCustomer,
  createOrder,
  updateOrder,
} from '../controllers/orders';

const router = Router();

router.get('/', getOrders);
router.get('/:id', getOrderById);
router.get('/customer/:customerId', getOrdersByCustomer);
router.post('/', createOrder);
router.put('/:id', updateOrder);

export default router;
