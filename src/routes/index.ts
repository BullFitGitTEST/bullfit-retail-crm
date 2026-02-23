import { Router } from 'express';
import customerRoutes from './customers';
import orderRoutes from './orders';
import prospectRoutes from './prospects';
import pipelineRoutes from './pipeline';
import activityRoutes from './activities';
import taskRoutes from './tasks';
import teamRoutes from './team';
import dashboardRoutes from './dashboard';
import callRoutes from './calls';
import campaignRoutes from './campaigns';
import webhookRoutes from './webhooks';

const router = Router();

// Existing routes
router.use('/customers', customerRoutes);
router.use('/orders', orderRoutes);

// New CRM routes
router.use('/prospects', prospectRoutes);
router.use('/pipeline', pipelineRoutes);
router.use('/activities', activityRoutes);
router.use('/tasks', taskRoutes);
router.use('/team', teamRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/calls', callRoutes);
router.use('/campaigns', campaignRoutes);

// Webhooks (no auth — Bland sends these directly)
router.use('/webhooks', webhookRoutes);

export default router;
