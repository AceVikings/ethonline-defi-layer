import express from 'express';
import { vincentHandler } from '../config/vincent.js';
import { login, getProfile, getBalances } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', vincentHandler(login));
router.get('/profile', vincentHandler(getProfile));
router.get('/balances', vincentHandler(getBalances));

export default router;
