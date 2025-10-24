import { getWebAuthClient } from '@lit-protocol/vincent-app-sdk/webAuthClient';
import { VINCENT_APP_ID, REDIRECT_URI } from '../config/constants';

export const vincentAuthClient = getWebAuthClient({
  appId: VINCENT_APP_ID,
});

export const redirectToVincentConnect = () => {
  vincentAuthClient.redirectToConnectPage({
    redirectUri: REDIRECT_URI,
  });
};

export const handleAuthCallback = async () => {
  try {
    if (!vincentAuthClient.uriContainsVincentJWT()) {
      throw new Error('No JWT found in URL');
    }
    
    const result = await vincentAuthClient.decodeVincentJWTFromUri(window.location.origin);
    
    if (!result) {
      throw new Error('Failed to decode JWT');
    }
    
    // Remove JWT from URL for security
    vincentAuthClient.removeVincentJWTFromURI();
    
    return { jwt: result.jwtStr, decoded: result.decodedJWT };
  } catch (error) {
    console.error('Auth callback error:', error);
    throw error;
  }
};

export const getStoredJWT = () => {
  return localStorage.getItem('vincentJWT');
};

export const clearAuth = () => {
  localStorage.removeItem('vincentJWT');
};
