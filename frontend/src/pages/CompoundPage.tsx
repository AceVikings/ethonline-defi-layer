import { CompoundYield } from '../components/CompoundYield';

export function CompoundPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 
          className="text-3xl lg:text-4xl font-bold text-off-white mb-2" 
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          Compound V3
        </h1>
        <p className="text-soft-gray">
          Supply assets to earn yield or use as collateral to borrow on Base and Polygon
        </p>
      </div>

      <CompoundYield />
    </div>
  );
}
