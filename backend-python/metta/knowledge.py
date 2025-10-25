"""
MeTTa Knowledge Graph for DeFi Workflows

This module initializes and manages a MeTTa knowledge graph containing:
- Supported blockchain networks
- Available tokens
- DeFi node types with configurations
- Workflow strategies
- Protocol information

Knowledge Structure:
- (node-type <type> <label> <description>)
- (node-config <type> <field> <default-value>)
- (token <symbol> <name> <address>)
- (chain <name> <chain-id> <rpc-url>)
- (strategy <name> <description> <node-sequence>)
- (protocol <name> <type> <chains>)
"""

from hyperon import MeTTa, E, S, ValueAtom


def get_metta_instance():
    """Initialize and return a MeTTa instance with DeFi knowledge."""
    metta = MeTTa()
    initialize_defi_knowledge(metta)
    return metta


def initialize_defi_knowledge(metta: MeTTa):
    """
    Initialize the DeFi knowledge graph with all domain knowledge.
    
    Args:
        metta: MeTTa instance to populate
    """
    
    print("[MeTTa] Initializing DeFi Knowledge Graph...")
    
    # ============================================
    # 1. DEFINE NODE TYPES
    # ============================================
    print("[MeTTa] Adding node types...")
    
    # Node type definitions: (node-type <type> <label> <description> <color>)
    node_types = [
        ("trigger", "Trigger", "Start the workflow execution", "from-yellow-400 to-orange-500"),
        ("swap", "Token Swap", "Exchange tokens on DEX", "from-blue-400 to-blue-600"),
        ("aave", "Aave Protocol", "Supply or borrow assets", "from-purple-400 to-purple-600"),
        ("transfer", "Token Transfer", "Send tokens to address", "from-green-400 to-green-600"),
        ("condition", "Conditional", "If/else branching logic", "from-pink-400 to-pink-600"),
        ("ai", "AI Agent", "AI-powered decision making", "from-indigo-400 to-indigo-600"),
    ]
    
    for node_type, label, description, color in node_types:
        metta.space().add_atom(E(
            S("node-type"),
            S(node_type),
            ValueAtom(label),
            ValueAtom(description),
            ValueAtom(color)
        ))
    
    # ============================================
    # 2. DEFINE NODE CONFIGURATIONS
    # ============================================
    print("[MeTTa] Adding node configuration schemas...")
    
    # Trigger node config
    metta.space().add_atom(E(S("node-config"), S("trigger"), S("triggerType"), ValueAtom("manual")))
    
    # Swap node config
    metta.space().add_atom(E(S("node-config"), S("swap"), S("protocol"), ValueAtom("uniswap")))
    metta.space().add_atom(E(S("node-config"), S("swap"), S("tokenIn"), ValueAtom("ETH")))
    metta.space().add_atom(E(S("node-config"), S("swap"), S("tokenOut"), ValueAtom("USDC")))
    metta.space().add_atom(E(S("node-config"), S("swap"), S("amount"), ValueAtom("")))
    metta.space().add_atom(E(S("node-config"), S("swap"), S("slippage"), ValueAtom("0.5")))
    
    # Aave node config
    metta.space().add_atom(E(S("node-config"), S("aave"), S("action"), ValueAtom("supply")))
    metta.space().add_atom(E(S("node-config"), S("aave"), S("asset"), ValueAtom("USDC")))
    metta.space().add_atom(E(S("node-config"), S("aave"), S("amount"), ValueAtom("")))
    metta.space().add_atom(E(S("node-config"), S("aave"), S("chain"), ValueAtom("base")))
    
    # Transfer node config
    metta.space().add_atom(E(S("node-config"), S("transfer"), S("token"), ValueAtom("USDC")))
    metta.space().add_atom(E(S("node-config"), S("transfer"), S("recipient"), ValueAtom("")))
    metta.space().add_atom(E(S("node-config"), S("transfer"), S("amount"), ValueAtom("")))
    
    # Condition node config
    metta.space().add_atom(E(S("node-config"), S("condition"), S("leftValue"), ValueAtom("")))
    metta.space().add_atom(E(S("node-config"), S("condition"), S("operator"), ValueAtom(">")))
    metta.space().add_atom(E(S("node-config"), S("condition"), S("rightValue"), ValueAtom("")))
    
    # AI node config
    metta.space().add_atom(E(S("node-config"), S("ai"), S("systemPrompt"), ValueAtom("You are a DeFi assistant.")))
    metta.space().add_atom(E(S("node-config"), S("ai"), S("userPrompt"), ValueAtom("")))
    metta.space().add_atom(E(S("node-config"), S("ai"), S("outputFormat"), ValueAtom("text")))
    
    # ============================================
    # 3. DEFINE TOKENS
    # ============================================
    print("[MeTTa] Adding token definitions...")
    
    # Common tokens: (token <symbol> <name> <decimals>)
    tokens = [
        ("ETH", "Ethereum", "18"),
        ("WETH", "Wrapped Ethereum", "18"),
        ("USDC", "USD Coin", "6"),
        ("USDT", "Tether USD", "6"),
        ("DAI", "Dai Stablecoin", "18"),
        ("WBTC", "Wrapped Bitcoin", "8"),
        ("UNI", "Uniswap", "18"),
        ("AAVE", "Aave Token", "18"),
        ("LINK", "Chainlink", "18"),
    ]
    
    for symbol, name, decimals in tokens:
        metta.space().add_atom(E(
            S("token"),
            S(symbol),
            ValueAtom(name),
            ValueAtom(decimals)
        ))
    
    # ============================================
    # 4. DEFINE BLOCKCHAIN NETWORKS
    # ============================================
    print("[MeTTa] Adding blockchain networks...")
    
    # Chains: (chain <name> <chain-id> <testnet?>)
    chains = [
        ("ethereum", "1", "false"),
        ("base", "8453", "false"),
        ("optimism", "10", "false"),
        ("arbitrum", "42161", "false"),
        ("polygon", "137", "false"),
        ("avalanche", "43114", "false"),
        ("bsc", "56", "false"),
        ("sepolia", "11155111", "true"),
        ("base-sepolia", "84532", "true"),
    ]
    
    for name, chain_id, is_testnet in chains:
        metta.space().add_atom(E(
            S("chain"),
            S(name),
            ValueAtom(chain_id),
            ValueAtom(is_testnet)
        ))
    
    # ============================================
    # 5. DEFINE DEFI STRATEGIES
    # ============================================
    print("[MeTTa] Adding DeFi strategies...")
    
    # Strategies: (strategy <name> <description> <node-sequence>)
    strategies = [
        ("maximize_yield_usdc", "Maximize yield on USDC", "trigger -> swap -> aave"),
        ("dollar_cost_average", "DCA into ETH from USDC", "trigger -> swap"),
        ("arbitrage_dex", "Arbitrage between DEXs", "trigger -> swap -> swap"),
        ("lending_strategy", "Supply assets to lending protocol", "trigger -> aave"),
        ("swap_and_transfer", "Swap tokens and send to address", "trigger -> swap -> transfer"),
        ("conditional_rebalance", "Rebalance based on conditions", "trigger -> condition -> swap -> aave"),
    ]
    
    for name, description, sequence in strategies:
        metta.space().add_atom(E(
            S("strategy"),
            S(name),
            ValueAtom(description),
            ValueAtom(sequence)
        ))
    
    # ============================================
    # 6. DEFINE PROTOCOL OPERATIONS
    # ============================================
    print("[MeTTa] Adding protocol operations...")
    
    # Operations: (operation <keyword> <node-type> <description>)
    operations = [
        ("swap_tokens", "swap", "Exchange one token for another"),
        ("supply_to_aave", "aave", "Supply assets to Aave V3"),
        ("borrow_from_aave", "aave", "Borrow assets from Aave V3"),
        ("transfer_tokens", "transfer", "Send tokens to an address"),
        ("check_condition", "condition", "Evaluate a condition"),
        ("ai_decision", "ai", "Make AI-powered decision"),
    ]
    
    for keyword, node_type, description in operations:
        metta.space().add_atom(E(
            S("operation"),
            S(keyword),
            S(node_type),
            ValueAtom(description)
        ))
    
    # ============================================
    # 7. DEFINE PROTOCOLS
    # ============================================
    print("[MeTTa] Adding DeFi protocols...")
    
    # Protocols: (protocol <name> <type> <supported-chains>)
    protocols = [
        ("uniswap", "dex", "ethereum,base,optimism,arbitrum,polygon"),
        ("1inch", "dex", "ethereum,base,optimism,arbitrum,polygon,bsc,avalanche"),
        ("aave", "lending", "ethereum,base,optimism,arbitrum,polygon,avalanche"),
    ]
    
    for name, protocol_type, chains_str in protocols:
        metta.space().add_atom(E(
            S("protocol"),
            S(name),
            S(protocol_type),
            ValueAtom(chains_str)
        ))
    
    print("[MeTTa] ✓ Knowledge graph initialized successfully!")
    print(f"[MeTTa] - {len(node_types)} node types")
    print(f"[MeTTa] - {len(tokens)} tokens")
    print(f"[MeTTa] - {len(chains)} blockchain networks")
    print(f"[MeTTa] - {len(strategies)} strategies")
    print(f"[MeTTa] - {len(operations)} operations")
    print(f"[MeTTa] - {len(protocols)} protocols")

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
