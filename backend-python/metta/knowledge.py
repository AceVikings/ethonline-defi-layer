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
        ("swap", "Token Swap", "Exchange tokens on DEX using Uniswap or 1inch", "from-blue-400 to-blue-600"),
        ("aave", "Aave Protocol", "Supply, withdraw, borrow, or repay on Aave V3", "from-purple-400 to-purple-600"),
        ("transfer", "Token Transfer", "Send ERC20 or native tokens to address", "from-green-400 to-green-600"),
        ("condition", "Conditional", "Compare values with true/false branches", "from-pink-400 to-pink-600"),
        ("ai", "AI Agent", "AI-powered analysis with ASI:One and MCP tools", "from-indigo-400 to-indigo-600"),
        ("mcp", "MCP Server", "Connect external tools via Model Context Protocol", "from-cyan-400 to-cyan-600"),
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
    metta.space().add_atom(E(S("node-config"), S("swap"), S("chain"), ValueAtom("base")))
    
    # Aave node config - All 4 operations: supply, withdraw, borrow, repay
    metta.space().add_atom(E(S("node-config"), S("aave"), S("action"), ValueAtom("supply")))
    metta.space().add_atom(E(S("node-config"), S("aave"), S("asset"), ValueAtom("USDC")))
    metta.space().add_atom(E(S("node-config"), S("aave"), S("amount"), ValueAtom("")))
    metta.space().add_atom(E(S("node-config"), S("aave"), S("chain"), ValueAtom("base")))
    metta.space().add_atom(E(S("node-config"), S("aave"), S("interestRateMode"), ValueAtom("2")))  # 1=Stable, 2=Variable
    metta.space().add_atom(E(S("node-config"), S("aave"), S("useAsCollateral"), ValueAtom("true")))
    
    # Aave actions
    metta.space().add_atom(E(S("aave-action"), S("supply"), ValueAtom("Deposit assets to earn interest")))
    metta.space().add_atom(E(S("aave-action"), S("withdraw"), ValueAtom("Withdraw supplied assets")))
    metta.space().add_atom(E(S("aave-action"), S("borrow"), ValueAtom("Borrow against collateral")))
    metta.space().add_atom(E(S("aave-action"), S("repay"), ValueAtom("Repay borrowed debt")))
    
    # Transfer node config - Supports both ERC20 and native tokens
    metta.space().add_atom(E(S("node-config"), S("transfer"), S("token"), ValueAtom("USDC")))
    metta.space().add_atom(E(S("node-config"), S("transfer"), S("recipient"), ValueAtom("")))
    metta.space().add_atom(E(S("node-config"), S("transfer"), S("amount"), ValueAtom("")))
    metta.space().add_atom(E(S("node-config"), S("transfer"), S("chain"), ValueAtom("base")))
    
    # Condition node config - Supports value inputs from side nodes
    metta.space().add_atom(E(S("node-config"), S("condition"), S("leftValue"), ValueAtom("")))
    metta.space().add_atom(E(S("node-config"), S("condition"), S("operator"), ValueAtom(">")))
    metta.space().add_atom(E(S("node-config"), S("condition"), S("rightValue"), ValueAtom("")))
    
    # Condition operators
    metta.space().add_atom(E(S("condition-operator"), S("=="), ValueAtom("Equal to")))
    metta.space().add_atom(E(S("condition-operator"), S("!="), ValueAtom("Not equal to")))
    metta.space().add_atom(E(S("condition-operator"), S(">"), ValueAtom("Greater than")))
    metta.space().add_atom(E(S("condition-operator"), S(">="), ValueAtom("Greater than or equal")))
    metta.space().add_atom(E(S("condition-operator"), S("<"), ValueAtom("Less than")))
    metta.space().add_atom(E(S("condition-operator"), S("<="), ValueAtom("Less than or equal")))
    
    # Condition handles - Value inputs and true/false outputs
    metta.space().add_atom(E(S("condition-input"), S("value1"), ValueAtom("Left side value from node output")))
    metta.space().add_atom(E(S("condition-input"), S("value2"), ValueAtom("Right side value from node output")))
    metta.space().add_atom(E(S("condition-output"), S("true"), ValueAtom("Condition met branch")))
    metta.space().add_atom(E(S("condition-output"), S("false"), ValueAtom("Condition not met branch")))
    
    # AI node config - Integrates with ASI:One and MCP
    metta.space().add_atom(E(S("node-config"), S("ai"), S("prompt"), ValueAtom("")))
    metta.space().add_atom(E(S("node-config"), S("ai"), S("model"), ValueAtom("gpt-4")))
    metta.space().add_atom(E(S("node-config"), S("ai"), S("temperature"), ValueAtom("0.7")))
    metta.space().add_atom(E(S("node-config"), S("ai"), S("maxTokens"), ValueAtom("1000")))
    
    # AI handles - MCP tool connection
    metta.space().add_atom(E(S("ai-input"), S("mcp-input"), ValueAtom("Connect MCP tools for AI to use")))
    
    # MCP node config - External tool servers
    metta.space().add_atom(E(S("node-config"), S("mcp"), S("mcpServer"), ValueAtom("blockscout")))
    metta.space().add_atom(E(S("node-config"), S("mcp"), S("toolName"), ValueAtom("")))
    metta.space().add_atom(E(S("node-config"), S("mcp"), S("parameters"), ValueAtom("{}")))
    
    # Available MCP servers
    metta.space().add_atom(E(S("mcp-server"), S("blockscout"), ValueAtom("Blockchain explorer and analytics")))
    metta.space().add_atom(E(S("mcp-server"), S("defi-analytics"), ValueAtom("DeFi protocol analytics")))
    metta.space().add_atom(E(S("mcp-server"), S("price-oracle"), ValueAtom("Token price data")))
    
    # MCP output handle
    metta.space().add_atom(E(S("mcp-output"), S("mcp-output"), ValueAtom("Connect to AI node for tool access")))
    
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
    
    # Chains: (chain <name> <chain-id> <testnet?> <aave-support?>)
    chains = [
        ("ethereum", "1", "false", "true"),
        ("base", "8453", "false", "true"),
        ("optimism", "10", "false", "true"),
        ("arbitrum", "42161", "false", "true"),
        ("polygon", "137", "false", "true"),
        ("avalanche", "43114", "false", "true"),
        ("bsc", "56", "false", "false"),
        ("sepolia", "11155111", "true", "true"),
        ("basesepolia", "84532", "true", "true"),
        ("arbitrumsepolia", "421614", "true", "true"),
        ("optimismsepolia", "11155420", "true", "true"),
        ("avalanchefuji", "43113", "true", "true"),
    ]
    
    for name, chain_id, is_testnet, has_aave in chains:
        metta.space().add_atom(E(
            S("chain"),
            S(name),
            ValueAtom(chain_id),
            ValueAtom(is_testnet),
            ValueAtom(has_aave)
        ))
    
    # ============================================
    # 5. DEFINE DEFI STRATEGIES
    # ============================================
    print("[MeTTa] Adding DeFi strategies...")
    
    # Strategies: (strategy <name> <description> <node-sequence>)
    strategies = [
        ("maximize_yield_usdc", "Maximize yield on USDC by supplying to Aave", "trigger -> aave(supply)"),
        ("swap_and_lend", "Swap ETH to USDC and supply to Aave", "trigger -> swap(ETH->USDC) -> aave(supply)"),
        ("dollar_cost_average", "DCA into ETH from USDC", "trigger -> swap(USDC->ETH)"),
        ("conditional_swap", "Swap only if condition is met", "trigger -> condition -> swap"),
        ("lending_strategy", "Supply assets to lending protocol", "trigger -> aave(supply)"),
        ("swap_and_transfer", "Swap tokens and send to address", "trigger -> swap -> transfer"),
        ("conditional_rebalance", "Rebalance based on price conditions", "trigger -> condition(true: swap->aave, false: hold)"),
        ("borrow_strategy", "Supply collateral and borrow stablecoin", "trigger -> aave(supply) -> aave(borrow)"),
        ("repay_loan", "Repay Aave debt", "trigger -> swap(get-asset) -> aave(repay)"),
        ("withdraw_and_transfer", "Withdraw from Aave and send to address", "trigger -> aave(withdraw) -> transfer"),
        ("ai_portfolio_analysis", "Use AI with blockchain data for decisions", "trigger -> mcp(blockscout) -> ai(analyze) -> swap"),
        ("automated_yield_optimizer", "AI analyzes APY and automatically optimizes", "trigger -> mcp(defi-analytics) -> ai(decide) -> condition -> aave"),
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
        ("swap_tokens", "swap", "Exchange one token for another using Uniswap or 1inch"),
        ("supply_to_aave", "aave", "Supply assets to Aave V3 to earn interest"),
        ("borrow_from_aave", "aave", "Borrow assets from Aave V3 against collateral"),
        ("withdraw_from_aave", "aave", "Withdraw supplied assets from Aave V3"),
        ("repay_aave_debt", "aave", "Repay borrowed assets to Aave V3"),
        ("transfer_tokens", "transfer", "Send ERC20 or native tokens to an address"),
        ("check_condition", "condition", "Evaluate comparison with true/false branches"),
        ("ai_decision", "ai", "Make AI-powered decision using ASI:One"),
        ("connect_mcp_tool", "mcp", "Connect external data via Model Context Protocol"),
        ("ai_with_tools", "ai+mcp", "AI agent with access to blockchain data tools"),
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
