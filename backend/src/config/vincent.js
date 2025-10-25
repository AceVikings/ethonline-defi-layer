import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createVincentUserMiddleware } from "@lit-protocol/vincent-app-sdk/expressMiddleware";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

export const vincentConfig = {
  appId: parseInt(process.env.VINCENT_APP_ID),
  allowedAudience: process.env.VINCENT_ALLOWED_AUDIENCE,
  delegateePrivateKey: process.env.VINCENT_DELEGATEE_PRIVATE_KEY,
};

// Validate configuration
if (!vincentConfig.appId || isNaN(vincentConfig.appId)) {
  throw new Error('VINCENT_APP_ID is required and must be a valid number');
}
if (!vincentConfig.allowedAudience) {
  throw new Error('VINCENT_ALLOWED_AUDIENCE is required');
}
if (!vincentConfig.delegateePrivateKey) {
  console.warn('⚠️  VINCENT_DELEGATEE_PRIVATE_KEY is not set - some features may not work');
}

export const { middleware: vincentAuthMiddleware, handler: vincentHandler } =
  createVincentUserMiddleware({
    allowedAudience: vincentConfig.allowedAudience,
    requiredAppId: vincentConfig.appId,
    userKey: "vincentUser",
  });
