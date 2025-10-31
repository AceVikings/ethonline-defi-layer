/**
 * WETH Wrapping/Unwrapping Utility
 * 
 * Provides functions to wrap ETH into WETH and unwrap WETH back to ETH
 * using Vincent SDK for execution on behalf of users.
 */

import { ethers } from 'ethers';
import { getVincentAbilityClient } from '@lit-protocol/vincent-app-sdk/abilityClient';
import { bundledVincentAbility as evmTxSignerAbility } from '@lit-protocol/vincent-ability-evm-transaction-signer';
import { getDelegateeSigner } from '../config/vincent.js';
import { getChainConfig } from '../config/chains.js';

// WETH ABI - only the functions we need
const WETH_ABI = [
  // deposit() - Wrap ETH to WETH
  'function deposit() payable',
  // withdraw(uint256 wad) - Unwrap WETH to ETH
  'function withdraw(uint256 wad)',
  // balanceOf(address) - Check WETH balance
  'function balanceOf(address owner) view returns (uint256)',
];

/**
 * Helper function to send transaction with automatic nonce retry
 * @param {Object} provider - Ethers provider
 * @param {string} signedTx - Signed transaction
 * @param {number} maxRetries - Maximum number of retries (default: 2)
 * @returns {Promise<Object>} - Transaction response
 */
async function sendTransactionWithRetry(provider, signedTx, maxRetries = 2) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`   ⚠️  Retry attempt ${attempt}/${maxRetries}...`);
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const txResponse = await provider.sendTransaction(signedTx);
      return txResponse;
    } catch (error) {
      lastError = error;
      
      // Check if it's a nonce error
      const isNonceError = error.code === 'NONCE_EXPIRED' || 
                          error.message?.includes('nonce too low') ||
                          error.message?.includes('nonce has already been used');
      
      if (isNonceError && attempt < maxRetries) {
        console.log(`   ⚠️  Nonce error detected: ${error.message}`);
        console.log(`   🔄 Will retry with fresh nonce...`);
        // Continue to next iteration
      } else {
        // Not a nonce error or out of retries
        throw error;
      }
    }
  }
  
  throw lastError;
}

/**
 * Wrap ETH into WETH
 * 
 * @param {Object} params - Wrapping parameters
 * @param {string} params.chainName - Chain name (e.g., 'sepolia', 'base')
 * @param {string} params.amount - Amount of ETH to wrap (in ETH, e.g., "0.001")
 * @param {string} params.userPkpAddress - User's PKP wallet address
 * @returns {Promise<Object>} - { success: boolean, txHash?: string, error?: string }
 */
export async function wrapETH({ chainName, amount, userPkpAddress }) {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`\n🔄 Retry attempt ${attempt}/${maxRetries} for ETH wrapping...`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay between retries
      }

      console.log('🔄 Wrapping ETH to WETH...');
      console.log(`   Chain: ${chainName}`);
      console.log(`   Amount: ${amount} ETH`);
      console.log(`   User: ${userPkpAddress}`);

      // Get chain configuration
      const chain = getChainConfig(chainName);
      const wethAddress = chain.wrappedNativeToken;
      const rpcUrl = chain.rpcUrl;

      console.log(`   WETH Contract: ${wethAddress}`);

      // Create provider for gas estimation
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

      // Parse amount to wei
      const amountWei = ethers.utils.parseEther(amount);

      // Create WETH contract interface
      const wethInterface = new ethers.utils.Interface(WETH_ABI);

      // Encode deposit() function call
      const data = wethInterface.encodeFunctionData('deposit', []);

      // Get current nonce (use 'pending' to include pending transactions)
      const nonce = await provider.getTransactionCount(userPkpAddress, 'pending');
      console.log(`   Current nonce: ${nonce}`);

      // Estimate gas
      const gasLimit = await provider.estimateGas({
        from: userPkpAddress,
        to: wethAddress,
        value: amountWei,
        data: data,
      });

      // Get gas price (with 10% buffer)
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice.mul(110).div(100); // 10% buffer

      // Build transaction
      const transaction = {
        to: wethAddress,
        value: amountWei.toHexString(),
        data: data,
        chainId: chain.chainId,
        nonce: nonce,
        gasLimit: gasLimit.toHexString(),
        gasPrice: gasPrice.toHexString(),
      };

      console.log('   Transaction built:', {
        to: transaction.to,
        value: transaction.value,
        nonce: transaction.nonce,
        gasLimit: transaction.gasLimit,
      });

      // Serialize transaction
      const serializedTx = ethers.utils.serializeTransaction(transaction);

      // Get EVM Transaction Signer ability client
      const signer = getDelegateeSigner();
      const evmTxClient = getVincentAbilityClient({
        bundledVincentAbility: evmTxSignerAbility,
        ethersSigner: signer,
      });

      // Execute transaction via Vincent
      console.log('   Executing wrap transaction...');
      const result = await evmTxClient.execute(
        {
          serializedTransaction: serializedTx,
        },
        {
          delegatorPkpEthAddress: userPkpAddress,
        }
      );

      if (!result.success) {
        throw new Error(result.runtimeError || 'Transaction failed');
      }

      // Extract the signed transaction
      const signedTx = result.result?.signedTransaction;
      const txHash = result.result?.deserializedSignedTransaction?.hash;

      if (!signedTx) {
        throw new Error('No signed transaction returned from Vincent');
      }

      console.log('✅ Transaction signed successfully!');
      console.log(`   Tx Hash (computed): ${txHash}`);
      console.log(`   Broadcasting transaction...`);

      // Broadcast the signed transaction to the network
      const txResponse = await provider.sendTransaction(signedTx);
      console.log(`   ✓ Transaction broadcasted: ${txResponse.hash}`);
      console.log(`   Waiting for confirmation...`);

      // Wait for the transaction to be mined
      const receipt = await txResponse.wait(1); // Wait for 1 confirmation
      console.log(`   ✓ Transaction confirmed in block ${receipt.blockNumber}`);
      console.log(`   Gas used: ${receipt.gasUsed.toString()}`);

      // Verify WETH balance increased
      const wethContract = new ethers.Contract(wethAddress, WETH_ABI, provider);
      const wethBalance = await wethContract.balanceOf(userPkpAddress);
      const wethBalanceFormatted = ethers.utils.formatEther(wethBalance);
      console.log(`   ✓ New WETH balance: ${wethBalanceFormatted} WETH`);

      console.log('✅ ETH wrapped successfully!');

      return {
        success: true,
        txHash: receipt.transactionHash,
        amount: amount,
        wethAddress: wethAddress,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        wethBalance: wethBalanceFormatted,
      };
    } catch (error) {
      lastError = error;
      console.error(`❌ Wrap ETH attempt ${attempt + 1}/${maxRetries + 1} failed:`, error.message);
      
      // Check if it's a nonce error (retry immediately with fresh nonce)
      const isNonceError = error.code === 'NONCE_EXPIRED' || 
                          error.message?.includes('nonce too low') ||
                          error.message?.includes('nonce has already been used');
      
      if (isNonceError) {
        console.log(`   ⚠️  Nonce error detected, will fetch fresh nonce on retry`);
      }
      
      // Retry on any error if we have attempts left
      if (attempt < maxRetries) {
        console.log(`   🔄 Will retry (${maxRetries - attempt} retries remaining)...`);
        continue;
      }
      
      // Out of retries
      console.error('❌ All retry attempts exhausted for ETH wrapping');
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // If we get here, all retries failed
  console.error('❌ Wrap ETH failed after all retries:', lastError.message);
  return {
    success: false,
    error: lastError.message,
  };
}

/**
 * Unwrap WETH back to ETH
 * 
 * @param {Object} params - Unwrapping parameters
 * @param {string} params.chainName - Chain name (e.g., 'sepolia', 'base')
 * @param {string} params.amount - Amount of WETH to unwrap (in WETH, e.g., "0.001")
 * @param {string} params.userPkpAddress - User's PKP wallet address
 * @returns {Promise<Object>} - { success: boolean, txHash?: string, error?: string }
 */
export async function unwrapWETH({ chainName, amount, userPkpAddress }) {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`\n🔄 Retry attempt ${attempt}/${maxRetries} for WETH unwrapping...`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay between retries
      }

      console.log('🔄 Unwrapping WETH to ETH...');
      console.log(`   Chain: ${chainName}`);
      console.log(`   Amount: ${amount} WETH`);
      console.log(`   User: ${userPkpAddress}`);

      // Get chain configuration
      const chain = getChainConfig(chainName);
      const wethAddress = chain.wrappedNativeToken;
      const rpcUrl = chain.rpcUrl;

      console.log(`   WETH Contract: ${wethAddress}`);

      // Create provider for gas estimation
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

      // Parse amount to wei
      const amountWei = ethers.utils.parseEther(amount);

      // Create WETH contract interface
      const wethInterface = new ethers.utils.Interface(WETH_ABI);

      // Encode withdraw() function call
      const data = wethInterface.encodeFunctionData('withdraw', [amountWei]);

      // Get current nonce (use 'pending' to include pending transactions)
      const nonce = await provider.getTransactionCount(userPkpAddress, 'pending');
      console.log(`   Current nonce: ${nonce}`);

      // Estimate gas
      const gasLimit = await provider.estimateGas({
        from: userPkpAddress,
        to: wethAddress,
        data: data,
      });

      // Get gas price (with 10% buffer)
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice.mul(110).div(100); // 10% buffer

      // Build transaction
      const transaction = {
        to: wethAddress,
        value: '0x00',
        data: data,
        chainId: chain.chainId,
        nonce: nonce,
        gasLimit: gasLimit.toHexString(),
        gasPrice: gasPrice.toHexString(),
      };

      console.log('   Transaction built:', {
        to: transaction.to,
        amount: amountWei.toString(),
        nonce: transaction.nonce,
        gasLimit: transaction.gasLimit,
      });

      // Serialize transaction
      const serializedTx = ethers.utils.serializeTransaction(transaction);

      // Get EVM Transaction Signer ability client
      const signer = getDelegateeSigner();
      const evmTxClient = getVincentAbilityClient({
        bundledVincentAbility: evmTxSignerAbility,
        ethersSigner: signer,
      });

      // Execute transaction via Vincent
      console.log('   Executing unwrap transaction...');
      const result = await evmTxClient.execute(
        {
          serializedTransaction: serializedTx,
        },
        {
          delegatorPkpEthAddress: userPkpAddress,
        }
      );

      if (!result.success) {
        throw new Error(result.runtimeError || 'Transaction failed');
      }

      // Extract the signed transaction
      const signedTx = result.result?.signedTransaction;

      if (!signedTx) {
        throw new Error('No signed transaction returned from Vincent');
      }

      console.log('✅ Transaction signed successfully!');
      console.log(`   Broadcasting transaction...`);

      // Broadcast the signed transaction to the network
      const txResponse = await provider.sendTransaction(signedTx);
      console.log(`   ✓ Transaction broadcasted: ${txResponse.hash}`);
      console.log(`   Waiting for confirmation...`);

      // Wait for the transaction to be mined
      const receipt = await txResponse.wait(1);
      console.log(`   ✓ Transaction confirmed in block ${receipt.blockNumber}`);

      console.log('✅ WETH unwrapped successfully!');

      return {
        success: true,
        txHash: receipt.transactionHash,
        amount: amount,
        wethAddress: wethAddress,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      lastError = error;
      console.error(`❌ Unwrap WETH attempt ${attempt + 1}/${maxRetries + 1} failed:`, error.message);
      
      // Check if it's a nonce error (retry immediately with fresh nonce)
      const isNonceError = error.code === 'NONCE_EXPIRED' || 
                          error.message?.includes('nonce too low') ||
                          error.message?.includes('nonce has already been used');
      
      if (isNonceError) {
        console.log(`   ⚠️  Nonce error detected, will fetch fresh nonce on retry`);
      }
      
      // Retry on any error if we have attempts left
      if (attempt < maxRetries) {
        console.log(`   🔄 Will retry (${maxRetries - attempt} retries remaining)...`);
        continue;
      }
      
      // Out of retries
      console.error('❌ All retry attempts exhausted for WETH unwrapping');
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // If we get here, all retries failed
  console.error('❌ Unwrap WETH failed after all retries:', lastError.message);
  return {
    success: false,
    error: lastError.message,
  };
}

/**
 * Check WETH balance for a user
 * 
 * @param {Object} params - Balance check parameters
 * @param {string} params.chainName - Chain name (e.g., 'sepolia', 'base')
 * @param {string} params.userPkpAddress - User's PKP wallet address
 * @returns {Promise<Object>} - { success: boolean, balance?: string, balanceWei?: string, error?: string }
 */
export async function getWETHBalance({ chainName, userPkpAddress }) {
  try {
    // Get chain configuration
    const chain = getChainConfig(chainName);
    const wethAddress = chain.wrappedNativeToken;
    const rpcUrl = chain.rpcUrl;

    // Create provider
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    // Create WETH contract
    const wethContract = new ethers.Contract(wethAddress, WETH_ABI, provider);

    // Get balance
    const balanceWei = await wethContract.balanceOf(userPkpAddress);
    const balance = ethers.utils.formatEther(balanceWei);

    return {
      success: true,
      balance: balance,
      balanceWei: balanceWei.toString(),
      wethAddress: wethAddress,
    };
  } catch (error) {
    console.error('❌ Get WETH balance failed:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}
