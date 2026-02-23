import { Router } from 'express';
import { getPipelineView, moveProspect } from '../controllers/pipeline';

const router = Router();

router.get('/', getPipelineView);
router.patch('/:id/move', moveProspect);

export default router;
