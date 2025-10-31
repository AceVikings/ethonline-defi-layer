/**
 * Token Transfer Utility
 * 
 * Provides functions to transfer native tokens (ETH) and ERC20 tokens
 * using Vincent SDK for execution on behalf of users.
 */

import { ethers } from 'ethers';
import { getVincentAbilityClient } from '@lit-protocol/vincent-app-sdk/abilityClient';
import { bundledVincentAbility as evmTxSignerAbility } from '@lit-protocol/vincent-ability-evm-transaction-signer';
import { getDelegateeSigner } from '../config/vincent.js';
import { getChainConfig } from '../config/chains.js';

// ERC20 ABI - only the functions we need
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

/**
 * Transfer Native ETH
 * 
 * @param {Object} params - Transfer parameters
 * @param {string} params.chainName - Chain name (e.g., 'sepolia', 'basesepolia')
 * @param {string} params.recipient - Recipient address
 * @param {string} params.amount - Amount of ETH to transfer (in ETH, e.g., "0.001")
 * @param {string} params.userPkpAddress - User's PKP wallet address
 * @returns {Promise<Object>} - { success: boolean, txHash?: string, error?: string }
 */
export async function transferNativeToken({ chainName, recipient, amount, userPkpAddress }) {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`\n🔄 Retry attempt ${attempt}/${maxRetries} for native ETH transfer...`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay between retries
      }

      console.log('🔄 Transferring Native ETH...');
      console.log(`   Chain: ${chainName}`);
      console.log(`   From: ${userPkpAddress}`);
      console.log(`   To: ${recipient}`);
      console.log(`   Amount: ${amount} ETH`);

      // Validate recipient address
      if (!ethers.utils.isAddress(recipient)) {
        throw new Error(`Invalid recipient address: ${recipient}`);
      }

      // Get chain configuration
      const chain = getChainConfig(chainName);
      const rpcUrl = chain.rpcUrl;

      // Create provider for gas estimation
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

      // Parse amount to wei
      const amountWei = ethers.utils.parseEther(amount);

      // Get current nonce (use 'pending' to include pending transactions)
      const nonce = await provider.getTransactionCount(userPkpAddress, 'pending');
      console.log(`   Current nonce: ${nonce}`);

    // Estimate gas for simple ETH transfer
    const gasLimit = await provider.estimateGas({
      from: userPkpAddress,
      to: recipient,
      value: amountWei,
    });

    // Get gas price (with 10% buffer)
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice.mul(110).div(100); // 10% buffer

    // Build transaction
    const transaction = {
      to: recipient,
      value: amountWei.toHexString(),
      data: '0x', // Empty data for simple transfer
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
    console.log('   Executing transfer transaction...');
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

    console.log('✅ Native ETH transferred successfully!');

      return {
        success: true,
        txHash: receipt.transactionHash,
        amount: amount,
        recipient: recipient,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      lastError = error;
      console.error(`❌ Transfer Native ETH attempt ${attempt + 1}/${maxRetries + 1} failed:`, error.message);
      
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
      console.error('❌ All retry attempts exhausted for native ETH transfer');
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // If we get here, all retries failed
  console.error('❌ Transfer Native ETH failed after all retries:', lastError.message);
  return {
    success: false,
    error: lastError.message,
  };
}

/**
 * Transfer ERC20 Token
 * 
 * @param {Object} params - Transfer parameters
 * @param {string} params.chainName - Chain name (e.g., 'sepolia', 'basesepolia')
 * @param {string} params.tokenAddress - ERC20 token contract address
 * @param {string} params.recipient - Recipient address
 * @param {string} params.amount - Amount of tokens to transfer (in token units, e.g., "100")
 * @param {string} params.userPkpAddress - User's PKP wallet address
 * @returns {Promise<Object>} - { success: boolean, txHash?: string, error?: string }
 */
export async function transferERC20Token({ chainName, tokenAddress, recipient, amount, userPkpAddress }) {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`\n🔄 Retry attempt ${attempt}/${maxRetries} for ERC20 transfer...`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay between retries
      }

      console.log('🔄 Transferring ERC20 Token...');
      console.log(`   Chain: ${chainName}`);
      console.log(`   Token: ${tokenAddress}`);
    console.log(`   From: ${userPkpAddress}`);
    console.log(`   To: ${recipient}`);
    console.log(`   Amount: ${amount}`);

    // Validate addresses
    if (!ethers.utils.isAddress(recipient)) {
      throw new Error(`Invalid recipient address: ${recipient}`);
    }
    if (!ethers.utils.isAddress(tokenAddress)) {
      throw new Error(`Invalid token address: ${tokenAddress}`);
    }

    // Get chain configuration
    const chain = getChainConfig(chainName);
    const rpcUrl = chain.rpcUrl;

    // Create provider
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

    // Create token contract interface
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

    // Get token details
    const [decimals, symbol] = await Promise.all([
      tokenContract.decimals(),
      tokenContract.symbol(),
    ]);

    console.log(`   Token: ${symbol} (${decimals} decimals)`);

    // Parse amount to smallest unit
    const amountWei = ethers.utils.parseUnits(amount, decimals);

    // Check balance
    const balance = await tokenContract.balanceOf(userPkpAddress);
    if (balance.lt(amountWei)) {
      throw new Error(
        `Insufficient balance. Required: ${amount} ${symbol}, Available: ${ethers.utils.formatUnits(balance, decimals)} ${symbol}`
      );
    }

    console.log(`   Balance check passed: ${ethers.utils.formatUnits(balance, decimals)} ${symbol}`);

    // Create token interface
    const tokenInterface = new ethers.utils.Interface(ERC20_ABI);

    // Encode transfer function call
    const data = tokenInterface.encodeFunctionData('transfer', [recipient, amountWei]);

    // Get current nonce (use 'pending' to include pending transactions)
    const nonce = await provider.getTransactionCount(userPkpAddress, 'pending');
    console.log(`   Current nonce: ${nonce}`);

    // Estimate gas
    const gasLimit = await provider.estimateGas({
      from: userPkpAddress,
      to: tokenAddress,
      data: data,
    });

    // Get gas price (with 10% buffer)
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice.mul(110).div(100); // 10% buffer

    // Build transaction
    const transaction = {
      to: tokenAddress,
      value: '0x00',
      data: data,
      chainId: chain.chainId,
      nonce: nonce,
      gasLimit: gasLimit.toHexString(),
      gasPrice: gasPrice.toHexString(),
    };

    console.log('   Transaction built:', {
      to: transaction.to,
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
    console.log('   Executing transfer transaction...');
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

    // Verify new balance
    const newBalance = await tokenContract.balanceOf(userPkpAddress);
    const newBalanceFormatted = ethers.utils.formatUnits(newBalance, decimals);
    console.log(`   ✓ New balance: ${newBalanceFormatted} ${symbol}`);

    console.log('✅ ERC20 token transferred successfully!');

    return {
      success: true,
      txHash: receipt.transactionHash,
      amount: amount,
      token: symbol,
      tokenAddress: tokenAddress,
      recipient: recipient,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      newBalance: newBalanceFormatted,
    };
    } catch (error) {
      lastError = error;
      console.error(`❌ Transfer ERC20 attempt ${attempt + 1}/${maxRetries + 1} failed:`, error.message);

      // Check if this is a nonce error (retry immediately with fresh nonce)
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
      console.error('❌ All retry attempts exhausted for ERC20 transfer');
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // If all retries exhausted
  return {
    success: false,
    error: lastError.message,
  };
}
