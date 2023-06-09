import { deleteMyPhoto } from '../../controllers/userController';
import restrictAuthenticated from '../../middleware/restrictAuthenticated';
import { Router } from 'express';

const router = Router();

router.patch('/photo', restrictAuthenticated(), deleteMyPhoto);

export default router;
