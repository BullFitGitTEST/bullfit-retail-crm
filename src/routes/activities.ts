import { Router } from 'express';
import {
  getActivitiesByProspect,
  getRecentActivities,
  createActivity,
} from '../controllers/activities';

const router = Router();

router.get('/recent', getRecentActivities);
router.get('/prospect/:prospectId', getActivitiesByProspect);
router.post('/', createActivity);

export default router;
