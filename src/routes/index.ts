import { Router } from 'express';
import customerRoutes from './customers';
import orderRoutes from './orders';

const router = Router();

router.use('/customers', customerRoutes);
router.use('/orders', orderRoutes);

export default router;
