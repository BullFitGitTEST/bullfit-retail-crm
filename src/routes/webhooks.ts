import { Router } from 'express';
import { handleBlandWebhook } from '../controllers/webhooks';

const router = Router();

// No auth middleware — Bland sends webhooks directly
router.post('/bland', handleBlandWebhook);

export default router;
