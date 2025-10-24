# DeFi Strategy Agent - Implementation Plan

## 🎯 Agent Overview

**Agent Name**: DeFi Portfolio Optimizer Agent

**Purpose**: Analyze user's DeFi positions across Aave and Compound protocols, evaluate market conditions, and provide intelligent recommendations to maximize yield while minimizing risk.

**Agent Type**: Hosted Agent on Agentverse (with ASI:One LLM integration)

---

## 📋 Core Capabilities

### 1. Portfolio Analysis
- Fetch user's current positions from Aave V3 (Base, Polygon, Sepolia)
- Fetch user's current positions from Compound V3 (Base, Polygon)
- Calculate total value locked (TVL) per protocol
- Calculate current yield generation across all positions
- Identify unutilized assets in wallet

### 2. Market Data Collection
- Real-time APY data from Aave markets (supply & borrow rates)
- Real-time APY data from Compound markets (supply & borrow rates)
- **Real-time price monitoring** for volatile assets (WETH, WBTC, WMATIC, cbETH, wstETH)
- **Price trend analysis** (1-hour, 4-hour, 24-hour trends)
- **Volatility detection** and crash prediction signals
- Historical price trends for major assets (7-day history)
- Utilization rates per protocol
- Liquidity depth analysis

### 3. Risk Assessment
- Calculate health factors for borrowing positions
- Identify liquidation risks
- Assess concentration risk (over-exposure to single asset)
- Evaluate protocol risk (smart contract risk, centralization)
- Monitor gas costs for recommended actions

### 4. Strategy Recommendations
- **Yield Optimization**: Suggest moving funds to higher APY opportunities
- **Risk Reduction**: Recommend collateral adjustments to improve health factor
- **Capital Efficiency**: Identify idle capital that could be deployed
- **Rebalancing**: Suggest portfolio rebalancing across protocols/chains
- **Loss Prevention**: Alert on deteriorating positions
- **🚨 Crash Protection**: Detect market downturns and recommend converting to stablecoins
- **🔄 Recovery Strategy**: Suggest re-entering positions when market stabilizes
- **📊 Volatility Hedging**: Recommend stablecoin allocation during high volatility

### 5. Execution Planning
- Generate step-by-step action plan
- Estimate gas costs for recommended actions
- Prioritize actions by impact (ROI vs risk)
- Provide clear reasoning for each recommendation

---

## 🏗️ Architecture

### Component Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│  - User wallet connection                                   │
│  - Display portfolio summary                                │
│  - Show agent recommendations                               │
│  - Execute recommended actions                              │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ Chat Protocol
                 │
┌────────────────▼────────────────────────────────────────────┐
│              DeFi Strategy Agent (uAgent)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Portfolio Fetcher                                    │  │
│  │  - Query Aave subgraph for user positions            │  │
│  │  - Query Compound contracts for user balances        │  │
│  │  - Fetch wallet balances via RPC                     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Market Data Collector                                │  │
│  │  - Fetch APYs from Aave contracts                     │  │
│  │  - Fetch APYs from Compound contracts                │  │
│  │  - Get price feeds from Chainlink oracles            │  │
│  │  - Historical data from CoinGecko/DeFiLlama          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Risk Analyzer                                        │  │
│  │  - Calculate health factors                           │  │
│  │  - Assess liquidation risks                           │  │
│  │  - Evaluate concentration risk                        │  │
│  │  - Protocol risk scoring                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Strategy Engine (ASI:One LLM)                        │  │
│  │  - Analyze portfolio + market data                    │  │
│  │  - Generate optimization strategies                   │  │
│  │  - Prioritize recommendations by ROI                  │  │
│  │  - Explain reasoning in natural language             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Response Builder                                     │  │
│  │  - Format recommendations for user                    │  │
│  │  - Include action buttons/links                       │  │
│  │  - Provide detailed reasoning                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### Phase 1: Data Collection Module

**File**: `backend/agents/portfolio_fetcher.py`

```python
from uagents import Agent, Context, Model, Protocol
from typing import Dict, List, Any
import requests
from web3 import Web3

class PortfolioRequest(Model):
    user_address: str
    chains: List[str]  # ["base", "polygon", "sepolia"]

class PortfolioData(Model):
    user_address: str
    aave_positions: Dict[str, Any]
    compound_positions: Dict[str, Any]
    wallet_balances: Dict[str, Any]
    total_value_usd: float
    current_yield_apy: float

class PortfolioFetcher:
    """Fetches user portfolio data from Aave, Compound, and wallet"""
    
    async def fetch_aave_positions(self, address: str, chain: str) -> Dict:
        """Query Aave subgraph for user positions"""
        # GraphQL query to Aave subgraph
        # Returns: supplied assets, borrowed assets, health factor
        pass
    
    async def fetch_compound_positions(self, address: str, chain: str) -> Dict:
        """Query Compound contracts for user balances"""
        # Contract calls: balanceOf, collateralBalanceOf, borrowBalanceOf
        pass
    
    async def fetch_wallet_balances(self, address: str, chains: List[str]) -> Dict:
        """Get wallet token balances across chains"""
        # ERC-20 balanceOf calls for major tokens
        pass
    
    async def calculate_total_value(self, portfolio: Dict) -> float:
        """Calculate total portfolio value in USD"""
        # Use price feeds to convert to USD
        pass
```

### Phase 2: Market Intelligence Module

**File**: `backend/agents/market_collector.py`

```python
class MarketRequest(Model):
    chains: List[str]
    protocols: List[str]  # ["aave", "compound"]

class MarketData(Model):
    aave_markets: Dict[str, Any]  # APYs, utilization, liquidity
    compound_markets: Dict[str, Any]
    price_trends: Dict[str, List[float]]  # Historical prices
    gas_prices: Dict[str, float]  # Current gas on each chain

class MarketCollector:
    """Collects real-time market data from DeFi protocols"""
    
    async def fetch_aave_markets(self, chain: str) -> Dict:
        """Get all Aave market data"""
        # Supply APY, borrow APY, utilization, liquidity
        pass
    
    async def fetch_compound_markets(self, chain: str) -> Dict:
        """Get all Compound market data"""
        # Supply APY, borrow APY, utilization, base asset info
        pass
    
    async def fetch_realtime_prices(self, tokens: List[str]) -> Dict:
        """Get real-time prices for immediate comparison"""
        # Chainlink oracles or CoinGecko real-time API
        pass
    
    async def fetch_price_trends(self, tokens: List[str]) -> Dict:
        """Get historical price data (7-day trends)"""
        # CoinGecko API or DeFiLlama
        pass
    
    async def analyze_price_momentum(self, token: str) -> Dict:
        """Analyze price momentum and trend direction"""
        # Calculate: 1h, 4h, 24h price changes
        # Detect: bullish, bearish, neutral, volatile
        # Return: trend_direction, volatility_score, crash_risk
        pass
    
    async def detect_crash_signals(self, prices: Dict) -> List[str]:
        """Detect potential market crash signals"""
        # Criteria:
        # - 5%+ drop in last hour
        # - 10%+ drop in last 4 hours
        # - 15%+ drop in last 24 hours
        # - Sudden volume spikes
        # Returns list of assets showing crash signals
        pass
    
    async def fetch_gas_prices(self, chains: List[str]) -> Dict:
        """Get current gas prices on each chain"""
        pass
```

### Phase 3: Risk Analysis Module

**File**: `backend/agents/risk_analyzer.py`

```python
class RiskAssessment(Model):
    health_factor: float
    liquidation_risk: str  # "low", "medium", "high"
    concentration_risk: Dict[str, float]
    protocol_risk_score: Dict[str, float]
    recommendations: List[str]

class RiskAnalyzer:
    """Analyzes portfolio risk across multiple dimensions"""
    
    def calculate_health_factor(self, positions: Dict) -> float:
        """Calculate weighted health factor across all positions"""
        pass
    
    def assess_liquidation_risk(self, health_factor: float) -> str:
        """Categorize liquidation risk"""
        # > 2.0: low, 1.5-2.0: medium, < 1.5: high
        pass
    
    def evaluate_concentration(self, portfolio: Dict) -> Dict:
        """Check if over-exposed to single asset/protocol"""
        pass
    
    def score_protocol_risk(self, protocols: List[str]) -> Dict:
        """Risk scoring based on TVL, audits, age, etc."""
        pass
```

### Phase 4: AI Strategy Engine (ASI:One Integration)

**File**: `backend/agents/strategy_agent.py`

```python
from uagents import Agent, Context, Protocol
from uagents_core.contrib.protocols.chat import (
    ChatMessage, ChatAcknowledgement, TextContent, chat_protocol_spec
)

# ASI:One endpoint addresses
OPENAI_AGENT = 'agent1q0h70caed8ax769shpemapzkyk65uscw4xwk6dc4t3emvp5jdcvqs9xs32y'

class StrategyRequest(Model):
    portfolio: PortfolioData
    markets: MarketData
    risk_assessment: RiskAssessment
    user_preferences: Dict[str, Any]  # risk tolerance, time horizon

class StrategyResponse(Model):
    recommendations: List[Dict[str, Any]]
    reasoning: str
    expected_apy_improvement: float
    execution_plan: List[Dict[str, Any]]

strategy_agent = Agent(
    name="defi_strategy_agent",
    seed="defi_strategy_unique_seed_2024",
    port=8100,
    mailbox=True
)

chat_proto = Protocol(spec=chat_protocol_spec)

@strategy_agent.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info("🤖 DeFi Strategy Agent started!")
    ctx.logger.info(f"📍 Address: {strategy_agent.address}")

@chat_proto.on_message(ChatMessage)
async def handle_strategy_request(ctx: Context, sender: str, msg: ChatMessage):
    """Process user request for portfolio optimization"""
    
    # 1. Extract user address from message
    user_address = extract_address_from_message(msg)
    
    # 2. Fetch portfolio data
    portfolio = await fetch_user_portfolio(user_address)
    
    # 3. Collect market data
    markets = await collect_market_data()
    
    # 4. Perform risk analysis
    risks = analyze_risks(portfolio)
    
    # 5. Analyze real-time price trends and crash signals
    crash_signals = await detect_crash_signals(markets)
    price_momentum = await analyze_price_momentum(portfolio.assets)
    
    # 6. Query ASI:One for strategy recommendations
    strategy_prompt = f"""
    You are a DeFi portfolio optimization expert. Analyze this portfolio and provide recommendations.
    
    PORTFOLIO:
    - Total Value: ${portfolio.total_value_usd:.2f}
    - Current APY: {portfolio.current_yield_apy:.2f}%
    - Aave Positions: {portfolio.aave_positions}
    - Compound Positions: {portfolio.compound_positions}
    
    MARKET CONDITIONS:
    - Aave Markets: {markets.aave_markets}
    - Compound Markets: {markets.compound_markets}
    - Price Trends: {markets.price_trends}
    
    🚨 REAL-TIME PRICE ANALYSIS:
    - Current Prices: {markets.realtime_prices}
    - 1h Price Change: {price_momentum.one_hour_change}
    - 4h Price Change: {price_momentum.four_hour_change}
    - 24h Price Change: {price_momentum.twenty_four_hour_change}
    - Volatility Score: {price_momentum.volatility_score}
    - Crash Signals Detected: {crash_signals}
    
    RISK ASSESSMENT:
    - Health Factor: {risks.health_factor}
    - Liquidation Risk: {risks.liquidation_risk}
    - Concentration Risk: {risks.concentration_risk}
    
    CRITICAL - CRASH PROTECTION RULES:
    🚨 If ANY asset shows crash signals (5%+ drop in 1h, 10%+ in 4h, or 15%+ in 24h):
       1. IMMEDIATELY recommend converting that asset to stablecoins (USDC)
       2. Explain the downtrend and potential further losses
       3. Mark as URGENT/HIGH priority
       4. Calculate potential loss if user doesn't act
       5. Suggest re-entry points when trend reverses
    
    🔄 If asset shows recovery signals (3 consecutive hourly gains after crash):
       1. Recommend converting back from stablecoins to the asset
       2. Explain the recovery trend
       3. Suggest optimal entry point
    
    📊 If volatility score > 8/10:
       1. Recommend partial conversion to stablecoins (50% hedge)
       2. Keep position size manageable during uncertainty
    
    Provide:
    1. Top 3 optimization opportunities
    2. Expected APY improvement for each
    3. Risk considerations
    4. Step-by-step execution plan
    5. Priority ranking (URGENT/HIGH/MEDIUM/LOW)
    6. Crash protection recommendations if applicable
    
    Focus on:
    - FIRST: Protecting capital from crashes (highest priority)
    - SECOND: Reducing liquidation risk if health factor < 2.0
    - THIRD: Maximizing yield while maintaining safety
    - FOURTH: Utilizing idle capital
    - FIFTH: Cross-chain opportunities
    """
    
    # Send to ASI:One
    ai_response = await query_asi_one(ctx, strategy_prompt)
    
    # 6. Parse and structure response
    recommendations = parse_recommendations(ai_response)
    
    # 7. Send formatted response to user
    response_text = format_recommendations(recommendations)
    await send_chat_response(ctx, sender, response_text)

strategy_agent.include(chat_proto, publish_manifest=True)
```

### Phase 5: Frontend Integration

**File**: `frontend/src/pages/AIStrategyPage.tsx`

```tsx
import React, { useState } from 'react';
import { useAccount } from 'wagmi';

export function AIStrategyPage() {
  const { address } = useAccount();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const requestAnalysis = async () => {
    setLoading(true);
    
    // Send message to DeFi Strategy Agent with real-time price monitoring
    const message = {
      user_address: address,
      analyze_portfolio: true,
      include_realtime_prices: true, // ← KEY: Request crash detection
      preferences: {
        risk_tolerance: 'medium',
        time_horizon: '30_days'
      }
    };
    
    // Use chat protocol to communicate with agent
    const response = await sendToAgent(STRATEGY_AGENT_ADDRESS, message);
    
    setAnalysis(response);
    setLoading(false);
  };

  // Auto-refresh every 5 minutes for continuous monitoring
  useEffect(() => {
    if (autoRefresh && address) {
      const interval = setInterval(requestAnalysis, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, address]);

  return (
    <div className="ai-strategy-container">
      <div className="header-section">
        <h1>🤖 AI Portfolio Optimizer</h1>
        <div className="controls">
          <button onClick={requestAnalysis} disabled={loading}>
            {loading ? '🔄 Analyzing...' : '🔍 Analyze My Portfolio'}
          </button>
          <label className="auto-refresh-toggle">
            <input 
              type="checkbox" 
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh (5 min)
          </label>
        </div>
      </div>
      
      {!analysis ? (
        <div className="placeholder">
          <p>Connect your wallet and click "Analyze My Portfolio" to get started</p>
        </div>
      ) : (
        <div className="recommendations">
          <h2>Optimization Recommendations</h2>
          
          {/* Current Portfolio Summary */}
          <div className="portfolio-summary">
            <h3>Your Current Portfolio</h3>
            <p>Total Value: ${analysis.portfolio.total_value_usd}</p>
            <p>Current APY: {analysis.portfolio.current_yield_apy}%</p>
            <p>Health Factor: {analysis.risks.health_factor}</p>
          </div>
          
          {/* AI Recommendations */}
          <div className="recommendations-list">
            {analysis.recommendations.map((rec, idx) => (
              <RecommendationCard 
                key={idx}
                recommendation={rec}
                onExecute={() => executeRecommendation(rec)}
              />
            ))}
          </div>
          
          {/* Expected Improvement */}
          <div className="improvement-summary">
            <h3>Expected Results</h3>
            <p>New APY: {analysis.expected_apy}%</p>
            <p>Improvement: +{analysis.apy_improvement}%</p>
            <p>Annual Gain: ${analysis.annual_gain_usd}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function RecommendationCard({ recommendation, onExecute }) {
  return (
    <div className="recommendation-card">
      <div className="rec-header">
        <h4>{recommendation.title}</h4>
        <span className={`priority-${recommendation.priority}`}>
          {recommendation.priority} priority
        </span>
      </div>
      
      <p className="reasoning">{recommendation.reasoning}</p>
      
      <div className="metrics">
        <div>
          <label>Expected APY</label>
          <span>{recommendation.expected_apy}%</span>
        </div>
        <div>
          <label>Est. Gas Cost</label>
          <span>${recommendation.gas_cost_usd}</span>
        </div>
        <div>
          <label>Annual Gain</label>
          <span>${recommendation.annual_gain_usd}</span>
        </div>
      </div>
      
      <div className="action-steps">
        <h5>Execution Steps:</h5>
        <ol>
          {recommendation.steps.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </div>
      
      <button onClick={onExecute} className="execute-btn">
        Execute This Strategy
      </button>
    </div>
  );
}
```

---

## 📊 Data Sources

### On-Chain Data
1. **Aave V3 Subgraph** (The Graph)
   - User positions: `https://api.thegraph.com/subgraphs/name/aave/protocol-v3-[chain]`
   - Query: `userReserves`, `reserves`

2. **Compound V3 Contracts**
   - Base: `0xb125E6687d4313864e53df431d5425969c15Eb2F`
   - Polygon: `0xF25212E676D1F7F89Cd72fFEe66158f541246445`
   - Methods: `balanceOf`, `collateralBalanceOf`, `getSupplyRate`, `getBorrowRate`

3. **Wallet Balances**
   - RPC calls to Base, Polygon, Sepolia
   - ERC-20 `balanceOf` for USDC, WETH, WBTC, etc.

### Market Data
1. **CoinGecko API** (Real-time & Historical Prices)
   - Real-time prices (updates every 30-60 seconds)
   - 1-hour, 4-hour, 24-hour price changes
   - 7-day price trends for major assets
   - Free tier: 50 calls/minute (sufficient for monitoring)
   - API endpoints:
     - `/simple/price` - Real-time prices with 1h/24h changes
     - `/coins/{id}/market_chart` - Historical data

2. **DeFiLlama API** (TVL, Protocol Stats)
   - Protocol TVL trends
   - Risk metrics
   - Volume analysis for crash detection

3. **Chainlink Price Feeds** (On-chain Real-time Prices)
   - On-chain price oracles
   - Most accurate real-time pricing
   - Direct contract reads (no rate limits)
   - Available for: ETH/USD, BTC/USD, MATIC/USD

### Gas Prices
- Base: `eth_gasPrice` RPC call
- Polygon: `eth_gasPrice` RPC call
- Gas cost estimation for recommended actions

---

## 🔴 Real-Time Price Monitoring Implementation

### Price Data Structure

```python
class PriceAnalysis(Model):
    asset_symbol: str
    current_price: float
    change_1h: float  # Percentage
    change_4h: float
    change_24h: float
    volatility_score: float  # 0-10 scale
    trend_direction: str  # "bullish", "bearish", "neutral"
    crash_signal: bool
    recovery_signal: bool
    last_updated: str  # ISO timestamp

class CrashDetector:
    """Detects market crash signals in real-time"""
    
    # Crash thresholds
    CRASH_1H_THRESHOLD = -5.0  # 5% drop in 1 hour
    CRASH_4H_THRESHOLD = -10.0  # 10% drop in 4 hours
    CRASH_24H_THRESHOLD = -15.0  # 15% drop in 24 hours
    HIGH_VOLATILITY_THRESHOLD = 8.0  # 8/10 volatility score
    
    # Recovery thresholds
    RECOVERY_CONSECUTIVE_GAINS = 3  # 3 hourly gains in a row
    RECOVERY_VOLATILITY_THRESHOLD = 6.0  # Volatility below 6/10
    
    def __init__(self):
        self.price_history = {}  # Store recent price history
        self.hourly_changes = {}  # Track hourly movements
    
    async def analyze_asset(self, symbol: str, prices: List[float], timestamps: List[str]) -> PriceAnalysis:
        """Analyze an asset for crash/recovery signals"""
        
        # Calculate price changes
        change_1h = self._calculate_change(prices, hours=1)
        change_4h = self._calculate_change(prices, hours=4)
        change_24h = self._calculate_change(prices, hours=24)
        
        # Calculate volatility (standard deviation of hourly returns)
        volatility_score = self._calculate_volatility(prices)
        
        # Detect trend
        trend = self._detect_trend(prices)
        
        # Check for crash signals
        crash_signal = (
            change_1h <= self.CRASH_1H_THRESHOLD or
            change_4h <= self.CRASH_4H_THRESHOLD or
            change_24h <= self.CRASH_24H_THRESHOLD
        )
        
        # Check for recovery signals
        recovery_signal = await self._detect_recovery(symbol, prices)
        
        return PriceAnalysis(
            asset_symbol=symbol,
            current_price=prices[-1],
            change_1h=change_1h,
            change_4h=change_4h,
            change_24h=change_24h,
            volatility_score=volatility_score,
            trend_direction=trend,
            crash_signal=crash_signal,
            recovery_signal=recovery_signal,
            last_updated=timestamps[-1]
        )
    
    def _calculate_change(self, prices: List[float], hours: int) -> float:
        """Calculate percentage change over specified hours"""
        if len(prices) < hours + 1:
            return 0.0
        old_price = prices[-(hours + 1)]
        new_price = prices[-1]
        return ((new_price - old_price) / old_price) * 100
    
    def _calculate_volatility(self, prices: List[float]) -> float:
        """Calculate volatility score (0-10) based on price movements"""
        if len(prices) < 2:
            return 0.0
        
        # Calculate hourly returns
        returns = []
        for i in range(1, len(prices)):
            ret = (prices[i] - prices[i-1]) / prices[i-1]
            returns.append(ret)
        
        # Standard deviation of returns
        std_dev = np.std(returns) if len(returns) > 0 else 0
        
        # Scale to 0-10 (typical crypto volatility range)
        volatility_score = min(std_dev * 1000, 10.0)  # Scale factor
        return round(volatility_score, 1)
    
    def _detect_trend(self, prices: List[float]) -> str:
        """Detect overall trend direction"""
        if len(prices) < 4:
            return "neutral"
        
        recent = prices[-4:]
        
        # Count ups vs downs
        ups = sum(1 for i in range(1, len(recent)) if recent[i] > recent[i-1])
        
        if ups >= 3:
            return "bullish"
        elif ups <= 1:
            return "bearish"
        else:
            return "neutral"
    
    async def _detect_recovery(self, symbol: str, prices: List[float]) -> bool:
        """Detect if asset is recovering from crash"""
        if len(prices) < self.RECOVERY_CONSECUTIVE_GAINS + 1:
            return False
        
        # Check for consecutive gains
        recent = prices[-(self.RECOVERY_CONSECUTIVE_GAINS + 1):]
        consecutive_gains = all(
            recent[i] > recent[i-1] 
            for i in range(1, len(recent))
        )
        
        # Check if volatility decreased
        volatility = self._calculate_volatility(prices)
        low_volatility = volatility < self.RECOVERY_VOLATILITY_THRESHOLD
        
        # Check if previously had crash signal
        had_crash = self.price_history.get(symbol, {}).get('had_crash', False)
        
        return consecutive_gains and low_volatility and had_crash

# Usage in agent
async def monitor_prices_and_alert(ctx: Context, portfolio: PortfolioData):
    """Continuous price monitoring with crash detection"""
    
    crash_detector = CrashDetector()
    
    # Get all volatile assets in portfolio
    volatile_assets = [
        asset for asset in portfolio.assets 
        if asset.symbol not in ['USDC', 'USDT', 'DAI']  # Exclude stablecoins
    ]
    
    # Fetch recent prices (last 24 hours, hourly data)
    for asset in volatile_assets:
        prices, timestamps = await fetch_hourly_prices(asset.symbol, hours=24)
        
        # Analyze for crash/recovery signals
        analysis = await crash_detector.analyze_asset(
            asset.symbol, 
            prices, 
            timestamps
        )
        
        # If crash detected, send URGENT notification
        if analysis.crash_signal:
            ctx.logger.warning(f"🚨 CRASH SIGNAL: {asset.symbol}")
            ctx.logger.warning(f"   1h: {analysis.change_1h}%, 4h: {analysis.change_4h}%, 24h: {analysis.change_24h}%")
            
            # Trigger urgent recommendation
            await generate_crash_protection_recommendation(
                ctx, 
                portfolio, 
                asset, 
                analysis
            )
        
        # If recovery detected, send opportunity notification
        elif analysis.recovery_signal:
            ctx.logger.info(f"📈 RECOVERY SIGNAL: {asset.symbol}")
            
            # Trigger re-entry recommendation
            await generate_recovery_recommendation(
                ctx, 
                portfolio, 
                asset, 
                analysis
            )
```

### CoinGecko Integration for Real-Time Prices

```python
import aiohttp
from datetime import datetime, timedelta

class CoinGeckoClient:
    """Client for CoinGecko API with real-time price monitoring"""
    
    BASE_URL = "https://api.coingecko.com/api/v3"
    
    # Coin ID mapping
    COIN_IDS = {
        'WETH': 'ethereum',
        'WBTC': 'wrapped-bitcoin',
        'WMATIC': 'matic-network',
        'cbETH': 'coinbase-wrapped-staked-eth',
        'wstETH': 'wrapped-steth'
    }
    
    async def get_realtime_prices_with_changes(self, symbols: List[str]) -> Dict:
        """Get current prices with 1h and 24h changes"""
        coin_ids = [self.COIN_IDS[symbol] for symbol in symbols if symbol in self.COIN_IDS]
        
        params = {
            'ids': ','.join(coin_ids),
            'vs_currencies': 'usd',
            'include_24hr_change': 'true',
            'include_1h_change': 'true'
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{self.BASE_URL}/simple/price", params=params) as resp:
                data = await resp.json()
                
                # Format response
                result = {}
                for symbol, coin_id in self.COIN_IDS.items():
                    if coin_id in data:
                        result[symbol] = {
                            'price': data[coin_id]['usd'],
                            'change_1h': data[coin_id].get('usd_1h_change', 0),
                            'change_24h': data[coin_id].get('usd_24h_change', 0)
                        }
                
                return result
    
    async def get_hourly_prices(self, symbol: str, hours: int = 24) -> Tuple[List[float], List[str]]:
        """Get hourly price data for trend analysis"""
        coin_id = self.COIN_IDS.get(symbol)
        if not coin_id:
            return [], []
        
        params = {
            'vs_currency': 'usd',
            'days': '1',  # Last 24 hours
            'interval': 'hourly'
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.BASE_URL}/coins/{coin_id}/market_chart",
                params=params
            ) as resp:
                data = await resp.json()
                
                # Extract prices and timestamps
                prices = [point[1] for point in data['prices']]
                timestamps = [
                    datetime.fromtimestamp(point[0] / 1000).isoformat()
                    for point in data['prices']
                ]
                
                return prices, timestamps
```

---

## 🧠 AI Strategy Prompting

### Prompt Template for ASI:One (with Crash Protection)

```python
STRATEGY_PROMPT_TEMPLATE = """
You are an expert DeFi portfolio manager with deep knowledge of Aave V3 and Compound V3 protocols.
You specialize in PROTECTING USER CAPITAL during market volatility and crashes.

CURRENT PORTFOLIO ANALYSIS:
==========================
User Address: {user_address}
Total Portfolio Value: ${total_value_usd:.2f}
Current Weighted APY: {current_apy:.2f}%
Timestamp: {current_timestamp}

AAVE V3 POSITIONS:
{aave_positions_formatted}

COMPOUND V3 POSITIONS:
{compound_positions_formatted}

WALLET BALANCES (Unutilized):
{wallet_balances_formatted}

AVAILABLE MARKET OPPORTUNITIES:
==============================
AAVE MARKETS:
{aave_markets_formatted}

COMPOUND MARKETS:
{compound_markets_formatted}

🚨 REAL-TIME PRICE ANALYSIS (CRITICAL):
======================================
Current Asset Prices:
{current_prices}

Price Changes Analysis:
{price_changes_table}
Asset    | 1h Change | 4h Change | 24h Change | Volatility | Status
---------|-----------|-----------|------------|------------|--------
WETH     | {weth_1h}% | {weth_4h}% | {weth_24h}% | {weth_vol}/10 | {weth_status}
WBTC     | {wbtc_1h}% | {wbtc_4h}% | {wbtc_24h}% | {wbtc_vol}/10 | {wbtc_status}
WMATIC   | {wmatic_1h}% | {wmatic_4h}% | {wmatic_24h}% | {wmatic_vol}/10 | {wmatic_status}

⚠️ CRASH SIGNALS DETECTED:
{crash_signals_list}

📈 RECOVERY SIGNALS DETECTED:
{recovery_signals_list}

RISK ASSESSMENT:
===============
Health Factor: {health_factor:.2f}
Liquidation Risk: {liquidation_risk}
Concentration Risk: {concentration_details}
Protocol Exposure: {protocol_exposure}
Market Exposure Risk: {market_exposure_risk}

USER PREFERENCES:
================
Risk Tolerance: {risk_tolerance}
Time Horizon: {time_horizon}
Gas Sensitivity: {gas_sensitivity}

🚨 CRITICAL DECISION RULES (FOLLOW STRICTLY):
============================================

RULE 1 - CRASH PROTECTION (HIGHEST PRIORITY):
IF any volatile asset shows:
  - 5%+ drop in last 1 hour, OR
  - 10%+ drop in last 4 hours, OR
  - 15%+ drop in last 24 hours
THEN:
  → Mark as URGENT priority
  → Recommend IMMEDIATE conversion to USDC stablecoin
  → Calculate potential loss if user delays
  → Provide clear explanation of downtrend
  → Example: "URGENT: WETH down 8% in 4h. Convert to USDC to prevent further losses. 
             Estimated additional loss if trend continues: $X. Can re-enter when 
             3 consecutive hourly gains detected."

RULE 2 - RECOVERY OPPORTUNITY:
IF asset previously crashed and now shows:
  - 3+ consecutive hourly price gains, AND
  - Volatility score dropped below 6/10
THEN:
  → Recommend converting USDC back to the asset
  → Mark as HIGH priority
  → Provide entry point reasoning
  → Example: "Recovery detected: WETH showing 3 hours of gains after drop. 
             Consider converting 50% of USDC back to WETH. Current entry: $X"

RULE 3 - HIGH VOLATILITY HEDGE:
IF volatility score > 8/10 but no clear crash:
THEN:
  → Recommend 50% conversion to stablecoins
  → Mark as MEDIUM priority
  → Keep optionality for both directions

RULE 4 - STABLE MARKET OPTIMIZATION:
IF all assets showing < 3% moves in 24h:
THEN:
  → Focus on APY optimization
  → Suggest cross-protocol moves
  → Deploy idle capital

TASK:
=====
Analyze this portfolio and provide TOP 3 actionable recommendations following the priority order:
1. FIRST: Crash protection (if signals detected)
2. SECOND: Liquidation risk reduction (if health factor < 2.0)
3. THIRD: Yield optimization
4. FOURTH: Capital efficiency

For EACH recommendation, provide:
1. **Title**: Clear action (e.g., "🚨 URGENT: Convert WETH to USDC - Crash Protection")
2. **Priority**: URGENT/HIGH/MEDIUM/LOW
3. **Category**: crash_protection / recovery_entry / risk_reduction / yield_optimization
4. **Expected APY Impact**: How this affects overall yield
5. **Capital Protection**: Amount of capital protected from potential losses
6. **Reasoning**: Why this action is needed NOW with data evidence
7. **Risk of Inaction**: What happens if user doesn't act
8. **Execution Steps**: Detailed step-by-step plan
9. **Gas Cost Estimate**: USD cost
10. **Net Benefit**: Gain/loss prevention minus gas costs
11. **Time Sensitivity**: How urgent (immediate / within 1h / within 24h / flexible)

Format your response as JSON:
{
  "market_status": "crash_detected" | "volatile" | "stable" | "recovery",
  "urgent_actions_required": true/false,
  "recommendations": [
    {
      "title": "🚨 URGENT: Convert WETH to USDC - Crash Protection",
      "priority": "URGENT",
      "category": "crash_protection",
      "expected_apy_impact": -2.5,  // Negative because moving to stablecoin
      "capital_protected_usd": 500.00,
      "reasoning": "WETH dropped 8% in past 4 hours with increasing volatility. Technical indicators suggest further downside risk of 5-10%. Converting to USDC preserves capital.",
      "risk_of_inaction": "If trend continues, expect $50-100 additional loss in next 12-24 hours",
      "price_evidence": {
        "current_price": 2450.00,
        "1h_change": -2.1,
        "4h_change": -8.3,
        "24h_change": -12.5,
        "volatility_score": 8.5
      },
      "steps": [
        "1. Withdraw WETH from current lending position",
        "2. Swap WETH to USDC on DEX (0.3% fee)",
        "3. Supply USDC to Compound V3 for 3.2% APY",
        "4. Set price alert for recovery signal"
      ],
      "gas_cost_usd": 12.00,
      "capital_protected_usd": 500.00,
      "net_benefit_usd": 488.00,
      "time_sensitivity": "immediate",
      "re_entry_criteria": "Wait for 3 consecutive hourly gains + volatility < 6/10"
    }
  ],
  "portfolio_summary": "Currently exposed to $X in volatile assets during market downturn. Immediate action recommended.",
  "overall_strategy": "Defensive positioning prioritized. Focus on capital preservation, then re-enter positions during recovery."
}
"""
```

---

## 🔐 Security Considerations

### Data Privacy
- **Never store user private keys** (agent only reads public data)
- Wallet connections handled by frontend (RainbowKit)
- Agent only receives wallet addresses

### Transaction Execution
- **Agent NEVER executes transactions directly**
- Agent only provides recommendations
- User must approve and sign all transactions in frontend

### API Security
- Rate limit ASI:One queries (6/hour in free tier)
- Cache portfolio data to reduce RPC calls
- Implement retry logic with exponential backoff

### Smart Contract Risk
- Clearly communicate protocol risks to users
- Recommend diversification across protocols
- Warn about unaudited/new protocols

---

## 📈 Success Metrics

### Agent Performance
- **Response Time**: < 10 seconds for full analysis
- **Recommendation Quality**: Measured by APY improvement
- **Risk Management**: No recommendations that worsen health factor

### User Outcomes
- **Average APY Improvement**: Target +2-5%
- **Portfolio Health**: Health factor maintained > 1.8
- **Capital Efficiency**: Reduce idle capital by 80%+

---

## 🚀 Implementation Phases

### Phase 1: MVP (Week 1-2)
- ✅ Set up uAgent with chat protocol
- ✅ Implement portfolio fetcher (Aave + Compound)
- ✅ Implement market data collector
- ✅ Basic ASI:One integration
- ✅ Simple frontend UI

**Deliverable**: Agent that fetches portfolio and provides basic APY comparison

### Phase 2: Intelligence (Week 3)
- ✅ Implement risk analyzer
- ✅ Advanced ASI:One prompting with context
- ✅ Historical price trend analysis
- ✅ Multi-factor recommendation scoring

**Deliverable**: Agent provides intelligent, risk-aware recommendations

### Phase 3: Execution (Week 4)
- ✅ Frontend execution flow (1-click apply recommendations)
- ✅ Transaction batching for gas efficiency
- ✅ Cross-chain strategy support
- ✅ Notification system for new opportunities

**Deliverable**: End-to-end user journey from analysis to execution

### Phase 4: Advanced Features (Future)
- 🔄 Real-time monitoring and alerts
- 🔄 Automated rebalancing (with user approval)
- 🔄 Historical performance tracking
- 🔄 Social features (share strategies, leaderboards)
- 🔄 Integration with more protocols (Lido, Curve, etc.)

---

## 📚 Required Dependencies

### Backend Agent
```txt
uagents==0.22.5
web3==6.15.0
requests==2.31.0
python-dotenv==1.0.0
aiohttp==3.9.0
```

### Environment Variables
```env
# RPC Endpoints
BASE_RPC_URL=https://mainnet.base.org
POLYGON_RPC_URL=https://polygon-rpc.com
SEPOLIA_RPC_URL=https://rpc.sepolia.org

# API Keys
COINGECKO_API_KEY=your_key_here
DEFILLAMA_API_KEY=your_key_here

# Agent Configuration
AGENTVERSE_API_KEY=your_api_key
STRATEGY_AGENT_ADDRESS=agent1q...

# ASI:One Endpoints
OPENAI_AGENT_ADDRESS=agent1q0h70caed8ax769shpemapzkyk65uscw4xwk6dc4t3emvp5jdcvqs9xs32y
CLAUDE_AGENT_ADDRESS=agent1qvk7q2av3e2y5gf5s90nfzkc8a48q3wdqeevwrtgqfdl0k78rspd6f2l4dx
```

---

## 🧪 Testing Strategy

### Unit Tests
- Portfolio fetcher: Mock subgraph/contract responses
- Market collector: Mock API responses
- Risk analyzer: Test edge cases (low health factor, etc.)

### Integration Tests
- End-to-end agent communication
- ASI:One query and response parsing
- Frontend to agent message flow

### User Testing
- Test with real wallets on testnets
- Validate recommendation quality
- Measure response times

---

## 📝 Next Steps

1. **Create agent structure** in `backend/agents/`
2. **Implement portfolio fetcher** with Aave + Compound integration
3. **Set up market data collector** with CoinGecko/DeFiLlama
4. **Build risk analyzer** with health factor calculations
5. **Integrate ASI:One** for strategy generation
6. **Create frontend page** for AI recommendations
7. **Test end-to-end flow** with sample portfolios
8. **Deploy to Agentverse** for production use

---

## 💡 Example User Journeys

### Journey 1: Normal Market - Yield Optimization

1. **User connects wallet** on AI Strategy page
2. **Clicks "Analyze My Portfolio"** button
3. **Agent fetches** all positions across Aave + Compound
4. **Agent collects** real-time market data and price trends
5. **Agent detects**: Stable market conditions (all assets < 3% change in 24h)
6. **ASI:One generates** yield optimization recommendations:
   - Move USDC from Aave (2.5% APY) to Compound (3.8% APY)
   - Deploy idle WETH to Aave for 4.2% APY
   - Cross-chain opportunity: Polygon has better USDC rates
7. **User sees** 3 prioritized recommendations with:
   - Clear reasoning
   - Expected APY improvement
   - Step-by-step execution plan
   - Risk considerations
8. **User clicks "Execute"** on chosen recommendation
9. **Frontend prepares transactions** (approve, supply, withdraw, etc.)
10. **User signs transactions** in wallet
11. **Agent monitors** and confirms execution
12. **User sees** updated portfolio with improved APY

### Journey 2: 🚨 Market Crash - Capital Protection

1. **User has auto-refresh enabled** (checking every 5 minutes)
2. **Market starts dropping**: WETH drops 8% in 4 hours
3. **Agent detects crash signals**:
   - WETH: -2.1% (1h), -8.3% (4h), -12.5% (24h)
   - Volatility score: 8.5/10
   - Trend: Strongly bearish
4. **🚨 URGENT alert appears** on dashboard:
   - "Market Crash Detected - Immediate Action Recommended"
   - Red banner with blinking indicator
5. **ASI:One generates URGENT recommendation**:
   ```
   Title: "🚨 URGENT: Convert WETH to USDC - Crash Protection"
   Priority: URGENT
   Time Sensitivity: IMMEDIATE
   
   Reasoning: "WETH dropped 8% in past 4 hours with increasing volatility. 
   Technical indicators suggest further downside risk of 5-10%. Converting to 
   USDC preserves capital."
   
   Risk of Inaction: "If trend continues, expect $50-100 additional loss in 
   next 12-24 hours based on current momentum."
   
   Capital Protected: $500
   Expected APY Impact: -2.5% (temporary - can re-enter on recovery)
   Net Benefit: $488 (after $12 gas cost)
   
   Re-entry Criteria: "Wait for 3 consecutive hourly gains + volatility < 6/10"
   ```
6. **User clicks "🚨 Execute Now"** button
7. **Frontend prepares defensive transactions**:
   - Withdraw WETH from Aave
   - Swap WETH → USDC (DEX)
   - Supply USDC to Compound
8. **User signs** and **capital is protected**
9. **Agent continues monitoring** for recovery signals
10. **24 hours later**: Agent detects 3 consecutive hourly gains
11. **New HIGH priority recommendation**:
    ```
    Title: "📈 Recovery Detected: Re-enter WETH Position"
    Priority: HIGH
    
    Reasoning: "WETH showing recovery with 3 hours of consecutive gains. 
    Volatility dropped to 5.2/10. Optimal entry point detected."
    
    Entry Price: $2,420 (vs $2,450 when exited)
    Expected Gain: $30 from better entry + resumed yield
    ```
12. **User re-enters position** at better price + saved from crash losses

### Journey 3: High Volatility - Partial Hedge

1. **Agent detects high volatility** (score 8/10) but no clear crash
2. **Recommendation**: "Hedge 50% of WETH to USDC"
3. **Reasoning**: "Uncertainty in market. Keep optionality"
4. **User executes partial hedge**
5. **If market crashes**: 50% protected
6. **If market rallies**: Still have 50% exposure to gains

---

## 🎯 Key Differentiators

1. **🚨 Crash Protection**: Real-time market monitoring with automatic crash detection
2. **AI-Powered**: Uses ASI:One for intelligent strategy generation
3. **Multi-Protocol**: Analyzes both Aave and Compound
4. **Cross-Chain**: Optimizes across Base, Polygon, Sepolia
5. **Risk-Aware**: Prioritizes capital protection over yield
6. **Actionable**: Provides clear execution plans, not just data
7. **Real-Time Monitoring**: Continuous price tracking with 5-minute refresh cycles
8. **Transparent**: Explains reasoning with price data evidence
9. **Recovery Signals**: Detects optimal re-entry points after crashes
10. **Volatility Hedging**: Recommends partial stablecoin conversion during uncertainty

### 🚨 Crash Protection Feature (Unique Advantage)

**What Makes This Special:**
- **Proactive Defense**: Agent detects crashes BEFORE major losses occur
- **Data-Driven Alerts**: Uses 1h/4h/24h price trends + volatility scoring
- **Automatic Recommendations**: Suggests immediate conversion to stablecoins
- **Loss Prevention**: Calculates potential losses if user doesn't act
- **Smart Re-entry**: Monitors for recovery and suggests optimal timing
- **Capital First**: Prioritizes protecting capital over chasing yield

**Typical Scenario:**
```
Market Crash Detected → Agent Alerts User → Convert to USDC → Avoid 10-15% Loss
Market Recovers → Agent Alerts User → Re-enter Position → Better entry price
Result: Capital protected + potential gain from better entry
```

**Competitive Advantage:**
Most DeFi dashboards only show historical data. This agent ACTIVELY PROTECTS users from market downturns by:
1. Monitoring prices every 5 minutes
2. Detecting crash patterns early
3. Recommending defensive actions with urgency indicators
4. Preventing emotional decision-making with data evidence
5. Timing re-entry for maximum gain

---

**Status**: Ready for implementation ✅

**Estimated Development Time**: 3-4 weeks for MVP

**Team Requirements**: 1-2 developers + LLM prompt engineer
