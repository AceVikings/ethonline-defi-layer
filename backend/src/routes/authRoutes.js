import express from 'express';
import { vincentHandler } from '../config/vincent.js';
import { login, getProfile } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', vincentHandler(login));
router.get('/profile', vincentHandler(getProfile));

export default router;
