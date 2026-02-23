import { Router } from 'express';
import {
  getProspects,
  getProspectById,
  createProspect,
  updateProspect,
  deleteProspect,
  updateProspectStage,
} from '../controllers/prospects';

const router = Router();

router.get('/', getProspects);
router.get('/:id', getProspectById);
router.post('/', createProspect);
router.put('/:id', updateProspect);
router.patch('/:id/stage', updateProspectStage);
router.delete('/:id', deleteProspect);

export default router;
