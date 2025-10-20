import { useEffect, useRef, useMemo } from "react";
import { WagmiProvider, useAccount } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { NexusProvider, useNexus } from "@avail-project/nexus-widgets";
import { AaveProvider, production, AaveClient } from "@aave/react";
import { config } from "./config/wagmi";
import { sepolia, polygon } from "wagmi/chains";
import { NetworkProvider, useNetwork } from "./contexts/NetworkContext";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

// WalletBridge component forwards wallet provider from wagmi to Nexus
function WalletBridge() {
  const { connector, isConnected } = useAccount();
  const { setProvider, sdk, isSdkInitialized, initializeSdk } = useNexus();
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    console.log("WalletBridge state:", {
      isConnected,
      hasConnector: !!connector,
      hasGetProvider: !!connector?.getProvider,
      isSdkInitialized,
      hasSdk: !!sdk,
      hasInitializedRef: hasInitializedRef.current,
    });

    // Reset initialization flag when wallet disconnects
    if (!isConnected) {
      hasInitializedRef.current = false;
      return;
    }

    // Skip if already initialized or in progress
    if (hasInitializedRef.current || isSdkInitialized) {
      return;
    }

    if (isConnected && connector?.getProvider) {
      console.log("Getting provider from connector...");
      hasInitializedRef.current = true; // Mark as in progress

      connector
        .getProvider()
        .then(async (provider) => {
          if (provider) {
            console.log("Setting provider in Nexus SDK:", provider);
            setProvider(provider as any);

            // Initialize the SDK after setting the provider
            if (initializeSdk) {
              try {
                console.log("Initializing Nexus SDK...");
                await initializeSdk(provider as any);
                console.log("Nexus SDK initialized successfully");

                // Give the SDK state a moment to update
                setTimeout(() => {
                  console.log("SDK state after initialization:", {
                    isSdkInitialized,
                    hasSdk: !!sdk,
                  });
                }, 100);
              } catch (err) {
                console.warn("Nexus SDK initialization warning (may be expected on some networks):", err);
                hasInitializedRef.current = false; // Reset on error so we can retry
              }
            }
          } else {
            console.warn("Provider is null/undefined");
            hasInitializedRef.current = false; // Reset if provider is null
          }
        })
        .catch((err) => {
          console.error("Error getting provider:", err);
          hasInitializedRef.current = false; // Reset on error so we can retry
        });
    }
  }, [isConnected, connector, setProvider, initializeSdk]);

  return null;
}

// Inner providers that need access to NetworkContext
function InnerProviders({ children }: { children: React.ReactNode }) {
  const { networkMode, isMainnet } = useNetwork();

  // Create Aave client with production environment
  const aaveClient = useMemo(() => {
    return AaveClient.create({
      environment: production,
    });
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AaveProvider client={aaveClient}>
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: isMainnet ? "#0ea5e9" : "#7c3aed",
              accentColorForeground: "white",
              borderRadius: "medium",
              fontStack: "system",
            })}
            initialChain={isMainnet ? polygon : sepolia}
          >
            {/* Key prop forces remount when network mode changes */}
            <NexusProvider
              key={networkMode}
              config={{
                debug: true,
                network: networkMode, // "testnet" or "mainnet"
              }}
            >
              <WalletBridge />
              {children}
            </NexusProvider>
          </RainbowKitProvider>
        </AaveProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NetworkProvider>
      <InnerProviders>{children}</InnerProviders>
    </NetworkProvider>
  );
}
