import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard';

const router = Router();

router.get('/', getDashboardStats);

export default router;
