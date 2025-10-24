import { createVincentUserMiddleware } from '@lit-protocol/vincent-app-sdk/expressMiddleware';

export const vincentConfig = {
  appId: parseInt(process.env.VINCENT_APP_ID),
  allowedAudience: process.env.VINCENT_ALLOWED_AUDIENCE,
  delegateePrivateKey: process.env.VINCENT_DELEGATEE_PRIVATE_KEY,
};

export const { middleware: vincentAuthMiddleware, handler: vincentHandler } = 
  createVincentUserMiddleware({
    allowedAudience: vincentConfig.allowedAudience,
    requiredAppId: vincentConfig.appId,
    userKey: 'vincentUser',
  });
