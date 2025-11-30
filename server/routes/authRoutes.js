import express from 'express';
import {
  registerUser,
  login,
  logout,
  refresh,
  getMe
} from '../controllers/authController.js';

import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', login);
router.get('/refresh', refresh);
router.get('/me',protect,getMe)
router.post('/logout',  logout);
export default router;
