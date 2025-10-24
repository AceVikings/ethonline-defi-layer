import { AaveYield } from '../components/AaveYield';

export function AavePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 
          className="text-3xl lg:text-4xl font-bold text-off-white mb-2" 
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Aave V3 Yield
        </h1>
        <p className="text-soft-gray">
          Bridge tokens from any chain and earn yield on Ethereum Sepolia
        </p>
      </div>

      <AaveYield />
    </div>
  );
}
