import { getWebAuthClient } from "@lit-protocol/vincent-app-sdk/webAuthClient";
import { VINCENT_APP_ID, REDIRECT_URI } from "../config/constants";

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
    // Check sessionStorage first (in case URL was already cleaned by React StrictMode)
    const storedJwt = sessionStorage.getItem("pending_vincent_jwt");
    if (storedJwt) {
      console.log("✅ Using stored JWT from sessionStorage");
      sessionStorage.removeItem("pending_vincent_jwt");

      // Still try to decode it with the SDK if possible
      try {
        const decoded = await vincentAuthClient.decodeVincentJWTFromUri(
          REDIRECT_URI
        );
        if (decoded) {
          return { jwt: decoded.jwtStr, decoded: decoded.decodedJWT };
        }
      } catch {
        // If SDK decode fails, return raw JWT (backend will verify)
        return { jwt: storedJwt, decoded: null };
      }
    }

    // Check if Vincent JWT exists in URL
    if (!vincentAuthClient.uriContainsVincentJWT()) {
      throw new Error("No JWT found in URL");
    }

    console.log("✅ Vincent JWT found in URL");

    // Store JWT in sessionStorage before SDK processes it (for React StrictMode)
    const urlParams = new URLSearchParams(window.location.search);
    const jwtParam = urlParams.get("vincent_jwt") || urlParams.get("jwt");
    if (jwtParam) {
      sessionStorage.setItem("pending_vincent_jwt", jwtParam);
    }

    // Decode and verify the JWT using Vincent SDK
    const result = await vincentAuthClient.decodeVincentJWTFromUri(
      REDIRECT_URI
    );

    if (!result) {
      throw new Error("Failed to decode JWT");
    }

    console.log("✅ JWT decoded and verified by Vincent SDK");
    console.log("   Subject:", result.decodedJWT.payload.sub);
    console.log("   Audience:", result.decodedJWT.payload.aud);

    // Remove JWT from URL for security
    vincentAuthClient.removeVincentJWTFromURI();

    // Clear from sessionStorage after successful processing
    sessionStorage.removeItem("pending_vincent_jwt");

    return { jwt: result.jwtStr, decoded: result.decodedJWT };
  } catch (error) {
    console.error("Auth callback error:", error);
    sessionStorage.removeItem("pending_vincent_jwt");
    throw error;
  }
};

export const getStoredJWT = () => {
  return localStorage.getItem("vincentJWT");
};

export const clearAuth = () => {
  localStorage.removeItem("vincentJWT");
};
