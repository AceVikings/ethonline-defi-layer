import { getPKPInfo } from "@lit-protocol/vincent-app-sdk/jwt";
import User from "../models/User.js";
import { ethers } from "ethers";
import { SUPPORTED_CHAINS } from "../config/chains.js";

export const login = async (req, res) => {
  try {
    const { decodedJWT } = req.vincentUser;
    const pkpInfo = getPKPInfo(decodedJWT);

    const user = await User.findOneAndUpdate(
      { pkpEthAddress: pkpInfo.ethAddress },
      {
        pkpPublicKey: pkpInfo.publicKey,
        pkpTokenId: pkpInfo.tokenId,
        authenticationMethod: decodedJWT.payload.authentication?.type,
        authenticationValue: decodedJWT.payload.authentication?.value,
        lastLogin: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      user: {
        id: user.pkpEthAddress,
        ethAddress: user.pkpEthAddress,
        authMethod: user.authenticationMethod,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const { decodedJWT } = req.vincentUser;
    const pkpInfo = getPKPInfo(decodedJWT);

    const user = await User.findOne({ pkpEthAddress: pkpInfo.ethAddress });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: user.pkpEthAddress,
        ethAddress: user.pkpEthAddress,
        publicKey: user.pkpPublicKey,
        tokenId: user.pkpTokenId,
        authMethod: user.authenticationMethod,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

export const getBalances = async (req, res) => {
  try {
    const { decodedJWT } = req.vincentUser;
    const pkpInfo = getPKPInfo(decodedJWT);
    const address = pkpInfo.ethAddress;

    // Fetch balances for all supported chains in parallel
    const balancePromises = Object.entries(SUPPORTED_CHAINS).map(
      async ([chainKey, chainConfig]) => {
        try {
          const provider = new ethers.providers.JsonRpcProvider(
            chainConfig.rpcUrl
          );
          const balance = await provider.getBalance(address);

          return {
            chainKey,
            chainId: chainConfig.chainId,
            chainName: chainConfig.name,
            balance: ethers.utils.formatEther(balance),
            symbol: chainConfig.nativeCurrency,
            isTestnet: [
              "sepolia",
              "basesepolia",
              "arbitrumsepolia",
              "optimismsepolia",
              "avalanchefuji",
              "polygonmumbai",
            ].includes(chainKey),
          };
        } catch (error) {
          console.error(
            `Failed to fetch balance for ${chainConfig.name}:`,
            error.message
          );
          return {
            chainKey,
            chainId: chainConfig.chainId,
            chainName: chainConfig.name,
            balance: "0.0",
            symbol: chainConfig.nativeCurrency,
            isTestnet: [
              "sepolia",
              "basesepolia",
              "arbitrumsepolia",
              "optimismsepolia",
              "avalanchefuji",
              "polygonmumbai",
            ].includes(chainKey),
            error: error.message,
          };
        }
      }
    );

    const balances = await Promise.all(balancePromises);

    res.json({
      success: true,
      address,
      balances,
    });
  } catch (error) {
    console.error("Get balances error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
