"""
MeTTa Knowledge Graph for DeFi Workflow Strategies

This module initializes a knowledge graph containing information about:
- Available node types and their capabilities
- DeFi protocols and supported operations
- Common workflow patterns and strategies
- Node configuration requirements
"""

from hyperon import MeTTa, E, S, ValueAtom


def initialize_defi_knowledge_graph(metta: MeTTa):
    """
    Initialize the DeFi knowledge graph with all available nodes,
    protocols, strategies, and configurations.
    """
    
    # ============================================================
    # NODE TYPES - Available workflow building blocks
    # ============================================================
    
    # Basic node type definitions
    metta.space().add_atom(E(S("node_type"), S("trigger"), S("workflow_initiator")))
    metta.space().add_atom(E(S("node_type"), S("swap"), S("token_exchange")))
    metta.space().add_atom(E(S("node_type"), S("aave"), S("lending_protocol")))
    metta.space().add_atom(E(S("node_type"), S("transfer"), S("token_movement")))
    metta.space().add_atom(E(S("node_type"), S("condition"), S("branching_logic")))
    metta.space().add_atom(E(S("node_type"), S("ai"), S("intelligent_decision")))
    
    # Node capabilities and descriptions
    metta.space().add_atom(E(S("capability"), S("trigger"), ValueAtom("Start workflow execution on-demand or scheduled")))
    metta.space().add_atom(E(S("capability"), S("swap"), ValueAtom("Exchange tokens using DEX protocols like Uniswap or 1inch")))
    metta.space().add_atom(E(S("capability"), S("aave"), ValueAtom("Supply, borrow, withdraw, or repay on Aave V3")))
    metta.space().add_atom(E(S("capability"), S("transfer"), ValueAtom("Send tokens to any Ethereum address")))
    metta.space().add_atom(E(S("capability"), S("condition"), ValueAtom("Conditional branching with true/false paths")))
    metta.space().add_atom(E(S("capability"), S("ai"), ValueAtom("AI-powered decision making using natural language")))
    
    # ============================================================
    # DEFI PROTOCOLS - Supported platforms
    # ============================================================
    
    # Swap protocols
    metta.space().add_atom(E(S("protocol"), S("swap"), S("uniswap")))
    metta.space().add_atom(E(S("protocol"), S("swap"), S("1inch")))
    
    # Lending protocols
    metta.space().add_atom(E(S("protocol"), S("lending"), S("aave")))
    
    # Protocol details
    metta.space().add_atom(E(S("protocol_info"), S("uniswap"), ValueAtom("Decentralized exchange with automated market making")))
    metta.space().add_atom(E(S("protocol_info"), S("1inch"), ValueAtom("DEX aggregator for best swap rates")))
    metta.space().add_atom(E(S("protocol_info"), S("aave"), ValueAtom("Decentralized lending and borrowing protocol")))
    
    # ============================================================
    # NODE CONFIGURATIONS - Required parameters
    # ============================================================
    
    metta.space().add_atom(E(S("config"), S("trigger"), ValueAtom("triggerType: manual | scheduled")))
    metta.space().add_atom(E(S("config"), S("swap"), ValueAtom("protocol, tokenIn, tokenOut, amount, slippage")))
    metta.space().add_atom(E(S("config"), S("aave"), ValueAtom("action: supply | borrow | withdraw | repay, asset, amount, chain")))
    metta.space().add_atom(E(S("config"), S("transfer"), ValueAtom("token, recipient, amount")))
    metta.space().add_atom(E(S("config"), S("condition"), ValueAtom("leftValue, operator, rightValue")))
    metta.space().add_atom(E(S("config"), S("ai"), ValueAtom("systemPrompt, userPrompt, outputFormat")))
    
    # ============================================================
    # DEFI STRATEGIES - Common workflow patterns
    # ============================================================
    
    # Yield farming strategy
    metta.space().add_atom(E(S("strategy"), S("maximize_yield_usdc"), 
        ValueAtom("trigger -> swap_to_usdc -> aave_supply")))
    
    # Dollar cost averaging
    metta.space().add_atom(E(S("strategy"), S("dca_into_eth"), 
        ValueAtom("trigger -> swap_usdc_to_eth")))
    
    # Automated rebalancing
    metta.space().add_atom(E(S("strategy"), S("rebalance_portfolio"), 
        ValueAtom("trigger -> condition -> swap -> aave_supply")))
    
    # Leverage position
    metta.space().add_atom(E(S("strategy"), S("leverage_position"), 
        ValueAtom("trigger -> aave_supply -> aave_borrow -> swap -> aave_supply")))
    
    # Take profit strategy
    metta.space().add_atom(E(S("strategy"), S("take_profit"), 
        ValueAtom("trigger -> condition -> swap_to_stable -> transfer")))
    
    # Stop loss strategy
    metta.space().add_atom(E(S("strategy"), S("stop_loss"), 
        ValueAtom("trigger -> condition -> swap_to_stable -> aave_supply")))
    
    # ============================================================
    # OPERATION MAPPINGS - User intent to node sequences
    # ============================================================
    
    metta.space().add_atom(E(S("operation"), S("swap_tokens"), 
        ValueAtom("trigger -> swap")))
    
    metta.space().add_atom(E(S("operation"), S("supply_to_aave"), 
        ValueAtom("trigger -> swap -> aave_supply")))
    
    metta.space().add_atom(E(S("operation"), S("borrow_from_aave"), 
        ValueAtom("trigger -> aave_borrow")))
    
    metta.space().add_atom(E(S("operation"), S("yield_farming"), 
        ValueAtom("trigger -> swap -> aave_supply")))
    
    metta.space().add_atom(E(S("operation"), S("arbitrage"), 
        ValueAtom("trigger -> condition -> swap -> swap")))
    
    # ============================================================
    # COMMON PROBLEMS & SOLUTIONS
    # ============================================================
    
    metta.space().add_atom(E(S("solution"), S("maximize_yield"), 
        ValueAtom("Convert volatile assets to stablecoins and supply to Aave")))
    
    metta.space().add_atom(E(S("solution"), S("protect_downside"), 
        ValueAtom("Use condition node to check price and sell if below threshold")))
    
    metta.space().add_atom(E(S("solution"), S("automate_dca"), 
        ValueAtom("Use scheduled trigger to buy tokens at regular intervals")))
    
    metta.space().add_atom(E(S("solution"), S("portfolio_rebalance"), 
        ValueAtom("Use AI node to decide optimal allocation, then swap accordingly")))
    
    # ============================================================
    # CONSIDERATIONS & BEST PRACTICES
    # ============================================================
    
    metta.space().add_atom(E(S("consideration"), S("gas_costs"), 
        ValueAtom("Complex workflows on mainnet can be expensive; consider L2s")))
    
    metta.space().add_atom(E(S("consideration"), S("slippage"), 
        ValueAtom("Large swaps may experience slippage; use 1inch for better rates")))
    
    metta.space().add_atom(E(S("consideration"), S("liquidation_risk"), 
        ValueAtom("Monitor health factor when borrowing; avoid high LTV ratios")))
    
    metta.space().add_atom(E(S("consideration"), S("smart_contract_risk"), 
        ValueAtom("DeFi protocols carry smart contract risk; diversify across protocols")))
    
    # ============================================================
    # SUPPORTED CHAINS
    # ============================================================
    
    chains = [
        "ethereum", "base", "arbitrum", "optimism", "polygon", "avalanche", "bsc", "celo",
        "sepolia", "basesepolia", "arbitrumsepolia", "optimismsepolia", "polygonmumbai", "avalanchefuji"
    ]
    
    for chain in chains:
        is_testnet = "sepolia" in chain or "mumbai" in chain or "fuji" in chain
        chain_type = "testnet" if is_testnet else "mainnet"
        metta.space().add_atom(E(S("chain"), S(chain), S(chain_type)))
    
    # ============================================================
    # TOKEN MAPPINGS
    # ============================================================
    
    # Common tokens across chains
    tokens = ["ETH", "WETH", "USDC", "USDT", "DAI", "WBTC", "LINK", "UNI", "AAVE"]
    
    for token in tokens:
        metta.space().add_atom(E(S("token"), S(token), S("erc20")))
    
    print("✅ DeFi Knowledge Graph initialized successfully")
    print(f"   - {len(chains)} supported chains")
    print(f"   - {len(tokens)} common tokens")
    print(f"   - 6 node types")
    print(f"   - 6 DeFi strategies")


def get_metta_instance():
    """
    Create and return a new MeTTa instance with initialized knowledge graph.
    """
    metta = MeTTa()
    initialize_defi_knowledge_graph(metta)
    return metta


if __name__ == "__main__":
    # Test the knowledge graph
    metta = get_metta_instance()
    
    # Example queries
    print("\n📊 Testing Knowledge Graph Queries:\n")
    
    # Query 1: Find all node types
    print("1. All node types:")
    result = metta.run('!(match &self (node_type $type $category) $type)')
    print(f"   {result}\n")
    
    # Query 2: Get swap capabilities
    print("2. Swap node capability:")
    result = metta.run('!(match &self (capability swap $desc) $desc)')
    print(f"   {result}\n")
    
    # Query 3: Get yield maximization strategy
    print("3. Maximize yield strategy:")
    result = metta.run('!(match &self (strategy maximize_yield_usdc $nodes) $nodes)')
    print(f"   {result}\n")
    
    # Query 4: Find all swap protocols
    print("4. Swap protocols:")
    result = metta.run('!(match &self (protocol swap $proto) $proto)')
    print(f"   {result}\n")
