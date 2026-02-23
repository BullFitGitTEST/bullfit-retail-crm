import { Router } from 'express';
import { initiateCall, getCalls, getCallById, endActiveCall } from '../controllers/calls';

const router = Router();

router.get('/', getCalls);
router.get('/:id', getCallById);
router.post('/', initiateCall);
router.post('/:id/end', endActiveCall);

export default router;
