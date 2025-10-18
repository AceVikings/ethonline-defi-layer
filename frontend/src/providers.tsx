import { useEffect, useRef } from 'react';
import { WagmiProvider, useAccount } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { NexusProvider, useNexus } from '@avail-project/nexus-widgets';
import { config } from './config/wagmi';
import { sepolia } from 'wagmi/chains';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

// WalletBridge component forwards wallet provider from wagmi to Nexus
function WalletBridge() {
  const { connector, isConnected } = useAccount();
  const { setProvider, sdk, isSdkInitialized, initializeSdk } = useNexus();
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    console.log('WalletBridge state:', { 
      isConnected, 
      hasConnector: !!connector, 
      hasGetProvider: !!connector?.getProvider,
      isSdkInitialized,
      hasSdk: !!sdk,
      hasInitializedRef: hasInitializedRef.current
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
      console.log('Getting provider from connector...');
      hasInitializedRef.current = true; // Mark as in progress
      
      connector.getProvider().then(async (provider) => {
        if (provider) {
          console.log('Setting provider in Nexus SDK:', provider);
          setProvider(provider as any);
          
          // Initialize the SDK after setting the provider
          if (initializeSdk) {
            try {
              console.log('Initializing Nexus SDK...');
              await initializeSdk(provider as any);
              console.log('Nexus SDK initialized successfully');
              
              // Give the SDK state a moment to update
              setTimeout(() => {
                console.log('SDK state after initialization:', { 
                  isSdkInitialized, 
                  hasSdk: !!sdk 
                });
              }, 100);
            } catch (err) {
              console.error('Error initializing SDK:', err);
              hasInitializedRef.current = false; // Reset on error so we can retry
            }
          }
        } else {
          console.warn('Provider is null/undefined');
          hasInitializedRef.current = false; // Reset if provider is null
        }
      }).catch((err) => {
        console.error('Error getting provider:', err);
        hasInitializedRef.current = false; // Reset on error so we can retry
      });
    }
  }, [isConnected, connector, setProvider, initializeSdk]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#7c3aed',
            accentColorForeground: 'white',
            borderRadius: 'medium',
            fontStack: 'system',
          })}
          initialChain={sepolia}
        >
          <NexusProvider
            config={{
              debug: false,
              network: 'testnet',
            }}
          >
            <WalletBridge />
            {children}
          </NexusProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
