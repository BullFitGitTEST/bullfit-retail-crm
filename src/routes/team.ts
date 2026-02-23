import { Router } from 'express';
import { getTeamMembers, getTeamMemberById, getTeamMemberStats } from '../controllers/team';

const router = Router();

router.get('/', getTeamMembers);
router.get('/:id', getTeamMemberById);
router.get('/:id/stats', getTeamMemberStats);

export default router;
