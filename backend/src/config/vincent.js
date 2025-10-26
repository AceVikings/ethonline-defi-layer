import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createVincentUserMiddleware } from "@lit-protocol/vincent-app-sdk/expressMiddleware";
import { ethers } from 'ethers';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { getVincentAbilityClient } from '@lit-protocol/vincent-app-sdk/abilityClient';
import { getSignedUniswapQuote, bundledVincentAbility as uniswapBundledAbility } from '@lit-protocol/vincent-ability-uniswap-swap';
import { bundledVincentAbility as erc20BundledAbility } from '@lit-protocol/vincent-ability-erc20-approval';
import { bundledVincentAbility as aaveBundledAbility } from '@lit-protocol/vincent-ability-aave';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

export const vincentConfig = {
  appId: parseInt(process.env.VINCENT_APP_ID),
  allowedAudience: process.env.VINCENT_ALLOWED_AUDIENCE,
  delegateePrivateKey: process.env.VINCENT_DELEGATEE_PRIVATE_KEY,
  litNetwork: process.env.LIT_NETWORK || 'datil',
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

// Singleton instances for Vincent SDK
let litNodeClient = null;
let delegateeSigner = null;

/**
 * Initialize the LIT Node Client (singleton)
 */
export async function getLitNodeClient() {
  if (!litNodeClient) {
    console.log('🔌 Initializing LIT Node Client...');
    
    litNodeClient = new LitNodeClient({
      litNetwork: vincentConfig.litNetwork,
      debug: process.env.NODE_ENV === 'development',
    });
    
    await litNodeClient.connect();
    console.log('✅ Connected to LIT Network:', vincentConfig.litNetwork);
  }
  
  return litNodeClient;
}

/**
 * Get delegatee signer (singleton)
 */
export function getDelegateeSigner() {
  if (!delegateeSigner) {
    const privateKey = vincentConfig.delegateePrivateKey;
    
    if (!privateKey) {
      throw new Error('DELEGATEE_PRIVATE_KEY environment variable not set');
    }
    
    // Use Lit's Yellowstone RPC for signing
    const yellowstoneProvider = new ethers.providers.JsonRpcProvider(
      'https://yellowstone-rpc.litprotocol.com/'
    );
    
    delegateeSigner = new ethers.Wallet(privateKey, yellowstoneProvider);
    console.log('🔑 Delegatee signer initialized:', delegateeSigner.address);
  }
  
  return delegateeSigner;
}

/**
 * Get Uniswap Swap Ability Client
 */
export function getUniswapSwapAbilityClient() {
  const signer = getDelegateeSigner();
  
  return getVincentAbilityClient({
    bundledVincentAbility: uniswapBundledAbility,
    ethersSigner: signer,
  });
}

/**
 * Get ERC20 Approval Ability Client
 */
export function getERC20ApprovalAbilityClient() {
  const signer = getDelegateeSigner();
  
  return getVincentAbilityClient({
    bundledVincentAbility: erc20BundledAbility,
    ethersSigner: signer,
  });
}

/**
 * Get Aave Ability Client
 */
export function getAaveAbilityClient() {
  const signer = getDelegateeSigner();
  
  return getVincentAbilityClient({
    bundledVincentAbility: aaveBundledAbility,
    ethersSigner: signer,
  });
}

/**
 * Generate a signed Uniswap quote
 */
export async function generateSignedUniswapQuote({
  rpcUrl,
  tokenInAddress,
  tokenInAmount,
  tokenOutAddress,
  recipient,
  slippageTolerance = 100, // 1% in basis points (100 = 1%)
}) {
  const litClient = await getLitNodeClient();
  const signer = getDelegateeSigner();
  
  console.log('📊 Generating signed Uniswap quote...');
  console.log(`   From: ${tokenInAmount} of ${tokenInAddress}`);
  console.log(`   To: ${tokenOutAddress}`);
  console.log(`   Slippage: ${slippageTolerance / 100}%`);
  
  const signedQuote = await getSignedUniswapQuote({
    quoteParams: {
      rpcUrl,
      tokenInAddress,
      tokenInAmount: tokenInAmount.toString(),
      tokenOutAddress,
      recipient,
      slippageTolerance,
    },
    ethersSigner: signer,
    litNodeClient: litClient,
  });
  
  console.log('✅ Signed quote generated');
  console.log(`   Expected output: ~${signedQuote.quote.amountOut} tokens`);
  console.log(`   Router: ${signedQuote.quote.to}`);
  
  return signedQuote;
}

/**
 * Disconnect from LIT Network
 */
export async function disconnectLitClient() {
  if (litNodeClient) {
    console.log('🔌 Disconnecting from LIT Network...');
    await litNodeClient.disconnect();
    litNodeClient = null;
    console.log('✅ Disconnected from LIT Network');
  }
}
