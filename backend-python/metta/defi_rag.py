"""
DeFi RAG (Retrieval-Augmented Generation) System

This module provides query interfaces for the MeTTa knowledge graph,
enabling structured retrieval of DeFi workflow information.
"""

from hyperon import MeTTa
from typing import List, Dict, Any, Optional


class DeFiWorkflowRAG:
    """
    RAG system for querying DeFi knowledge graph using MeTTa.
    """
    
    def __init__(self, metta_instance: MeTTa):
        """
        Initialize RAG with MeTTa instance.
        
        Args:
            metta_instance: Initialized MeTTa knowledge graph
        """
        self.metta = metta_instance
    
    # ============================================
    # NODE TYPE QUERIES
    # ============================================
    
    def get_all_node_types(self) -> List[Dict[str, str]]:
        """
        Get all available node types.
        
        Returns:
            List of node type dictionaries with type, label, description, color
        """
        query_str = '!(match &self (node-type $type $label $desc $color) ($type $label $desc $color))'
        results = self.metta.run(query_str)
        
        # Parse MeTTa results - format: [[[type, label, desc, color], [type, label, desc, color], ...]]
        node_types = []
        if results and len(results) > 0:
            for result_set in results:
                if isinstance(result_set, list):
                    for item in result_set:
                        if isinstance(item, list) and len(item) >= 4:
                            node_types.append({
                                "type": str(item[0]).strip('"'),
                                "label": str(item[1]).strip('"'),
                                "description": str(item[2]).strip('"'),
                                "color": str(item[3]).strip('"')
                            })
        
        return node_types
    
    def get_node_config(self, node_type: str) -> Dict[str, str]:
        """
        Get default configuration for a node type.
        
        Args:
            node_type: Type of node (e.g., "swap", "aave")
            
        Returns:
            Dictionary of config field -> default value
        """
        query_str = f'!(match &self (node-config {node_type} $field $value) ($field $value))'
        results = self.metta.run(query_str)
        
        config = {}
        for result in results:
            if result and len(result) > 0 and len(result[0]) >= 2:
                field = str(result[0][0])
                value = str(result[0][1])
                config[field] = value
        
        return config
    
    # ============================================
    # STRATEGY QUERIES
    # ============================================
    
    def find_strategy_for_intent(self, user_query: str) -> Optional[List[Any]]:
        """
        Find a strategy that matches user intent.
        
        Args:
            user_query: Natural language query
            
        Returns:
            Strategy information if found
        """
        # Extract keywords from query
        query_lower = user_query.lower()
        
        # Query for strategies
        if "yield" in query_lower or "maximize" in query_lower:
            return self.query_strategy("maximize_yield_usdc")
        elif "dca" in query_lower or "dollar cost" in query_lower:
            return self.query_strategy("dollar_cost_average")
        elif "arbitrage" in query_lower:
            return self.query_strategy("arbitrage_dex")
        elif "lend" in query_lower or "supply" in query_lower or "borrow" in query_lower:
            return self.query_strategy("lending_strategy")
        elif "rebalance" in query_lower:
            return self.query_strategy("conditional_rebalance")
        
        return None
    
    def query_strategy(self, strategy_name: str) -> List[Any]:
        """
        Query for a specific strategy.
        
        Args:
            strategy_name: Name of the strategy
            
        Returns:
            Strategy details (node sequence)
        """
        query_str = f'!(match &self (strategy {strategy_name} $desc $sequence) $sequence)'
        results = self.metta.run(query_str)
        return results
    
    def query_all_strategies(self) -> List[Dict[str, str]]:
        """
        Get all available strategies.
        
        Returns:
            List of strategy dictionaries
        """
        query_str = '!(match &self (strategy $name $desc $sequence) ($name $desc $sequence))'
        results = self.metta.run(query_str)
        
        # MeTTa returns format: [[(name "desc"), (name "desc"), ...]]
        # Each item is an Atom-like object with string representation like: (maximize_yield_usdc "trigger -> swap_to_usdc -> aave_supply")
        strategies = []
        if results and len(results) > 0:
            for result_set in results:
                if isinstance(result_set, list):
                    for item in result_set:
                        # Convert Atom to string and parse
                        item_str = str(item)
                        # Format: (name "description")
                        if '(' in item_str and '"' in item_str:
                            # Extract name (before first space) and description (in quotes)
                            parts = item_str.strip('()').split('"')
                            if len(parts) >= 2:
                                name = parts[0].strip()
                                sequence = parts[1].strip()
                                strategies.append({
                                    "name": name,
                                    "description": f"Strategy: {name}",
                                    "sequence": sequence
                                })
        
        return strategies
    
    # ============================================
    # OPERATION QUERIES
    # ============================================
    
    def query_operation(self, keyword: str) -> List[Any]:
        """
        Query for a specific operation.
        
        Args:
            keyword: Operation keyword (e.g., "swap_tokens")
            
        Returns:
            Operation details (node type)
        """
        query_str = f'!(match &self (operation {keyword} $node_type $desc) $node_type)'
        results = self.metta.run(query_str)
        return results
    
    def get_all_operations(self) -> List[Dict[str, str]]:
        """
        Get all available operations.
        
        Returns:
            List of operation dictionaries
        """
        query_str = '!(match &self (operation $keyword $node_type $desc) ($keyword $node_type $desc))'
        results = self.metta.run(query_str)
        
        # Parse MeTTa results
        operations = []
        if results and len(results) > 0:
            for result_set in results:
                if isinstance(result_set, list):
                    for item in result_set:
                        if isinstance(item, list) and len(item) >= 3:
                            operations.append({
                                "keyword": str(item[0]).strip('"'),
                                "node_type": str(item[1]).strip('"'),
                                "description": str(item[2]).strip('"')
                            })
        
        return operations
    
    # ============================================
    # PROTOCOL QUERIES
    # ============================================
    
    def query_protocols(self) -> List[Dict[str, str]]:
        """
        Get all DeFi protocols.
        
        Returns:
            List of protocol dictionaries
        """
        query_str = '!(match &self (protocol $name $type $chains) ($name $type $chains))'
        results = self.metta.run(query_str)
        
        # MeTTa returns: [["[uniswap, 1inch, aave]"]] - just return this simplified
        # For now, just return a simple list of protocol names
        protocols = []
        if results and len(results) > 0:
            result_str = str(results[0][0]) if results[0] else ""
            # Extract protocol names from string like "[uniswap, 1inch, aave]"
            result_str = result_str.strip('[]"\'')
            protocol_names = [p.strip() for p in result_str.split(',')]
            protocols = [{"name": name, "type": "dex", "chains": "all"} for name in protocol_names if name]
        
        return protocols
    
    # ============================================
    # TOKEN & CHAIN QUERIES
    # ============================================
    
    def query_token(self, symbol: str) -> List[Any]:
        """
        Query for token information.
        
        Args:
            symbol: Token symbol (e.g., "USDC")
            
        Returns:
            Token details
        """
        query_str = f'!(match &self (token {symbol} $name $decimals) ($name $decimals))'
        results = self.metta.run(query_str)
        return results
    
    def get_token_address(self, chain: str, symbol: str) -> Optional[Dict[str, str]]:
        """
        Get token address for a specific chain and symbol.
        
        Args:
            chain: Chain name (e.g., "basesepolia", "ethereum")
            symbol: Token symbol (e.g., "USDC", "ETH")
            
        Returns:
            Dictionary with token details including address, or None if not found
        """
        query_str = f'!(match &self (token-address {chain} {symbol} $name $address $decimals) ($name $address $decimals))'
        results = self.metta.run(query_str)
        
        if results and len(results) > 0 and len(results[0]) > 0:
            result = results[0]
            if isinstance(result, list) and len(result) >= 3:
                return {
                    "chain": chain,
                    "symbol": symbol,
                    "name": str(result[0]).strip('"'),
                    "address": str(result[1]).strip('"'),
                    "decimals": str(result[2]).strip('"')
                }
        
        return None
    
    def get_all_tokens_for_chain(self, chain: str) -> List[Dict[str, str]]:
        """
        Get all tokens available on a specific chain.
        
        Args:
            chain: Chain name (e.g., "basesepolia", "ethereum")
            
        Returns:
            List of token dictionaries with symbol, name, address, decimals
        """
        query_str = f'!(match &self (token-address {chain} $symbol $name $address $decimals) ($symbol $name $address $decimals))'
        results = self.metta.run(query_str)
        
        tokens = []
        if results and len(results) > 0:
            for result_set in results:
                if isinstance(result_set, list):
                    for item in result_set:
                        if isinstance(item, list) and len(item) >= 4:
                            tokens.append({
                                "symbol": str(item[0]).strip('"'),
                                "name": str(item[1]).strip('"'),
                                "address": str(item[2]).strip('"'),
                                "decimals": str(item[3]).strip('"')
                            })
        
        return tokens
    
    def get_all_token_addresses(self) -> Dict[str, List[Dict[str, str]]]:
        """
        Get all token addresses grouped by chain.
        
        Returns:
            Dictionary mapping chain name to list of token dictionaries
        """
        query_str = '!(match &self (token-address $chain $symbol $name $address $decimals) ($chain $symbol $name $address $decimals))'
        results = self.metta.run(query_str)
        
        print(f"[DEBUG] get_all_token_addresses raw results: {results}")
        print(f"[DEBUG] results type: {type(results)}, len: {len(results) if results else 0}")
        if results and len(results) > 0:
            print(f"[DEBUG] First result: {results[0]}, type: {type(results[0])}")
            if len(results[0]) > 0:
                print(f"[DEBUG] First item in first result: {results[0][0]}, type: {type(results[0][0])}")
        
        # Group by chain
        token_map = {}
        if results and len(results) > 0:
            for result_set in results:
                if isinstance(result_set, list):
                    for item in result_set:
                        print(f"[DEBUG] Processing token item: {item}, type: {type(item)}")
                        if isinstance(item, list) and len(item) >= 5:
                            chain = str(item[0]).strip('"')
                            if chain not in token_map:
                                token_map[chain] = []
                            
                            token_map[chain].append({
                                "symbol": str(item[1]).strip('"'),
                                "name": str(item[2]).strip('"'),
                                "address": str(item[3]).strip('"'),
                                "decimals": str(item[4]).strip('"')
                            })
        
        print(f"[DEBUG] Final token_map: {token_map}")
        return token_map
    
    def get_all_tokens(self) -> List[Dict[str, str]]:
        """
        Get all supported tokens.
        
        Returns:
            List of token dictionaries
        """
        query_str = '!(match &self (token $symbol $name $decimals) ($symbol $name $decimals))'
        results = self.metta.run(query_str)
        
        # Parse MeTTa results
        tokens = []
        if results and len(results) > 0:
            for result_set in results:
                if isinstance(result_set, list):
                    for item in result_set:
                        if isinstance(item, list) and len(item) >= 3:
                            tokens.append({
                                "symbol": str(item[0]).strip('"'),
                                "name": str(item[1]).strip('"'),
                                "decimals": str(item[2]).strip('"')
                            })
        
        return tokens
    
    def get_all_chains(self) -> List[Dict[str, str]]:
        """
        Get all supported blockchain networks.
        
        Returns:
            List of chain dictionaries
        """
        query_str = '!(match &self (chain $name $chain_id $testnet) ($name $chain_id $testnet))'
        results = self.metta.run(query_str)
        
        # Parse MeTTa results
        chains = []
        if results and len(results) > 0:
            for result_set in results:
                if isinstance(result_set, list):
                    for item in result_set:
                        if isinstance(item, list) and len(item) >= 3:
                            chains.append({
                                "name": str(item[0]).strip('"'),
                                "chainId": str(item[1]).strip('"'),
                                "testnet": str(item[2]).strip('"') == "true"
                            })
        
        return chains
    
    # ============================================
    # KNOWLEDGE EXPANSION
    # ============================================
    
    def add_knowledge(self, relation_type: str, subject: str, object_value: str):
        """
        Add new knowledge to the graph.
        
        Args:
            relation_type: Type of relation (e.g., "token", "strategy")
            subject: Subject of the relation
            object_value: Object/value of the relation
        """
        from hyperon import E, S, ValueAtom
        
        self.metta.space().add_atom(E(
            S(relation_type),
            S(subject),
            ValueAtom(object_value)
        ))
        
        print(f"[MeTTa] Added knowledge: ({relation_type} {subject} {object_value})")
    
    def __init__(self, metta_instance: MeTTa):
        self.metta = metta_instance
    
    def query_capability(self, node_type: str):
        """
        Get the capability description for a specific node type.
        
        Args:
            node_type: The type of node (e.g., 'swap', 'aave', 'transfer')
            
        Returns:
            List of capability descriptions
        """
        query_str = f'!(match &self (capability {node_type} $desc) $desc)'
        result = self.metta.run(query_str)
        return self._extract_results(result)
    
    def query_strategy(self, strategy_name: str):
        """
        Get the node sequence for a specific strategy.
        
        Args:
            strategy_name: Name of the strategy (e.g., 'maximize_yield_usdc')
            
        Returns:
            Node sequence as a string
        """
        query_str = f'!(match &self (strategy {strategy_name} $nodes) $nodes)'
        result = self.metta.run(query_str)
        return self._extract_results(result)
    
    def query_all_strategies(self):
        """
        Get all available strategies.
        
        Returns:
            List of (strategy_name, node_sequence) tuples
        """
        query_str = '!(match &self (strategy $name $nodes) ($name $nodes))'
        result = self.metta.run(query_str)
        return result
    
    def query_operation(self, operation_name: str):
        """
        Get the node sequence for a specific operation.
        
        Args:
            operation_name: Name of operation (e.g., 'swap_tokens', 'yield_farming')
            
        Returns:
            Node sequence as a string
        """
        query_str = f'!(match &self (operation {operation_name} $nodes) $nodes)'
        result = self.metta.run(query_str)
        return self._extract_results(result)
    
    def query_node_config(self, node_type: str):
        """
        Get configuration requirements for a specific node type.
        
        Args:
            node_type: The type of node
            
        Returns:
            Configuration requirements as a string
        """
        query_str = f'!(match &self (config {node_type} $params) $params)'
        result = self.metta.run(query_str)
        return self._extract_results(result)
    
    def query_protocols(self, protocol_type: str = None):
        """
        Get available protocols, optionally filtered by type.
        
        Args:
            protocol_type: Optional filter (e.g., 'swap', 'lending')
            
        Returns:
            List of protocol names
        """
        if protocol_type:
            query_str = f'!(match &self (protocol {protocol_type} $proto) $proto)'
        else:
            query_str = '!(match &self (protocol $type $proto) $proto)'
        
        result = self.metta.run(query_str)
        return self._extract_results(result)
    
    def query_solution(self, problem: str):
        """
        Get solution recommendation for a specific problem.
        
        Args:
            problem: Problem description (e.g., 'maximize_yield', 'protect_downside')
            
        Returns:
            Solution description
        """
        query_str = f'!(match &self (solution {problem} $desc) $desc)'
        result = self.metta.run(query_str)
        return self._extract_results(result)
    
    def query_consideration(self, topic: str):
        """
        Get best practice considerations for a topic.
        
        Args:
            topic: Topic to get considerations for (e.g., 'gas_costs', 'slippage')
            
        Returns:
            Consideration description
        """
        query_str = f'!(match &self (consideration {topic} $desc) $desc)'
        result = self.metta.run(query_str)
        return self._extract_results(result)
    
    def query_chains(self, chain_type: str = None):
        """
        Get supported chains, optionally filtered by type.
        
        Args:
            chain_type: Optional filter ('mainnet' or 'testnet')
            
        Returns:
            List of chain names
        """
        if chain_type:
            query_str = f'!(match &self (chain $name {chain_type}) $name)'
        else:
            query_str = '!(match &self (chain $name $type) $name)'
        
        result = self.metta.run(query_str)
        return self._extract_results(result)
    
    def find_strategy_for_intent(self, intent: str):
        """
        Find the most relevant strategy based on user intent.
        Uses fuzzy matching on strategy names and solutions.
        
        Args:
            intent: User's stated goal (e.g., "I want to maximize my yield")
            
        Returns:
            Matching strategy name and node sequence
        """
        intent_lower = intent.lower()
        
        # Try direct strategy match
        if "yield" in intent_lower or "maximize" in intent_lower:
            return self.query_strategy("maximize_yield_usdc")
        elif "dca" in intent_lower or "dollar cost" in intent_lower:
            return self.query_strategy("dca_into_eth")
        elif "rebalance" in intent_lower:
            return self.query_strategy("rebalance_portfolio")
        elif "leverage" in intent_lower:
            return self.query_strategy("leverage_position")
        elif "take profit" in intent_lower or "sell" in intent_lower:
            return self.query_strategy("take_profit")
        elif "stop loss" in intent_lower or "protect" in intent_lower:
            return self.query_strategy("stop_loss")
        
        # Fallback: return all strategies
        return self.query_all_strategies()
    
    def add_knowledge(self, relation: str, subject: str, object_value):
        """
        Dynamically add new knowledge to the graph.
        
        Args:
            relation: Type of relationship (e.g., 'strategy', 'solution')
            subject: Subject of the relation
            object_value: Object/value of the relation
        """
        from hyperon import E, S, ValueAtom
        
        if isinstance(object_value, str):
            self.metta.space().add_atom(E(S(relation), S(subject), ValueAtom(object_value)))
        else:
            self.metta.space().add_atom(E(S(relation), S(subject), S(object_value)))
        
        print(f"✅ Added knowledge: {relation}({subject}, {object_value})")
    
    def _extract_results(self, metta_result):
        """
        Extract clean results from MeTTa query output.
        
        Args:
            metta_result: Raw result from MeTTa query
            
        Returns:
            Cleaned list of results
        """
        if not metta_result:
            return []
        
        # MeTTa returns results as nested lists/tuples
        # Extract the actual values
        results = []
        for item in metta_result:
            if hasattr(item, 'get_children'):
                # It's an expression, extract its value
                children = item.get_children()
                if children:
                    results.append(str(children[0]))
            else:
                results.append(str(item))
        
        return results if results else metta_result


if __name__ == "__main__":
    # Test the RAG system
    from knowledge import get_metta_instance
    
    metta = get_metta_instance()
    rag = DeFiWorkflowRAG(metta)
    
    print("\n📊 Testing DeFi Workflow RAG:\n")
    
    # Test capability query
    print("1. Swap capability:")
    print(f"   {rag.query_capability('swap')}\n")
    
    # Test strategy query
    print("2. Maximize yield strategy:")
    print(f"   {rag.query_strategy('maximize_yield_usdc')}\n")
    
    # Test protocols
    print("3. Swap protocols:")
    print(f"   {rag.query_protocols('swap')}\n")
    
    # Test solution
    print("4. Solution for maximizing yield:")
    print(f"   {rag.query_solution('maximize_yield')}\n")
    
    # Test intent matching
    print("5. Intent matching:")
    intent = "I want to maximize my yield on USDC"
    print(f"   Intent: '{intent}'")
    print(f"   Strategy: {rag.find_strategy_for_intent(intent)}\n")
