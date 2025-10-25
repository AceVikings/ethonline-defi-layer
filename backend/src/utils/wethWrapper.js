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
 * Wrap ETH into WETH
 * 
 * @param {Object} params - Wrapping parameters
 * @param {string} params.chainName - Chain name (e.g., 'sepolia', 'base')
 * @param {string} params.amount - Amount of ETH to wrap (in ETH, e.g., "0.001")
 * @param {string} params.userPkpAddress - User's PKP wallet address
 * @returns {Promise<Object>} - { success: boolean, txHash?: string, error?: string }
 */
export async function wrapETH({ chainName, amount, userPkpAddress }) {
  try {
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

    // Get current nonce
    const nonce = await provider.getTransactionCount(userPkpAddress, 'latest');

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

    console.log('✅ ETH wrapped successfully!');
    console.log(`   Tx Hash: ${result.result.transactionHash}`);

    return {
      success: true,
      txHash: result.result.transactionHash,
      amount: amount,
      wethAddress: wethAddress,
    };
  } catch (error) {
    console.error('❌ Wrap ETH failed:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
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
  try {
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

    // Get current nonce
    const nonce = await provider.getTransactionCount(userPkpAddress, 'latest');

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

    console.log('✅ WETH unwrapped successfully!');
    console.log(`   Tx Hash: ${result.result.transactionHash}`);

    return {
      success: true,
      txHash: result.result.transactionHash,
      amount: amount,
      wethAddress: wethAddress,
    };
  } catch (error) {
    console.error('❌ Unwrap WETH failed:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
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
