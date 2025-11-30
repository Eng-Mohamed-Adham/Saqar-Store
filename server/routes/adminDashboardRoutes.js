// routes/adminDashboardRoutes.js
import express from 'express';
import { getAdminDashboardData,banOrUnbanSeller } from '../controllers/adminDashboardController.js';
import {
    protect,
    requireRole
} from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/admin',protect,requireRole('admin') , getAdminDashboardData);
router.patch('/ban/:sellerId',protect,requireRole('admin') , banOrUnbanSeller);


export default router;
