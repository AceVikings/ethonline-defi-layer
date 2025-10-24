import { getPKPInfo } from '@lit-protocol/vincent-app-sdk/jwt';
import User from '../models/User.js';

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
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
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
        error: 'User not found' 
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
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
