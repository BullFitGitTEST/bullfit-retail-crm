import { Router } from 'express';
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  launchCampaign,
  pauseCampaign,
} from '../controllers/campaigns';

const router = Router();

router.get('/', getCampaigns);
router.get('/:id', getCampaignById);
router.post('/', createCampaign);
router.post('/:id/launch', launchCampaign);
router.post('/:id/pause', pauseCampaign);

export default router;
