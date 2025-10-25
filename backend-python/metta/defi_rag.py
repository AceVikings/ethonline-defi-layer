"""
DeFi Workflow RAG System

This module provides retrieval and query functionality for the MeTTa knowledge graph,
enabling intelligent workflow generation based on user intents.
"""

from hyperon import MeTTa


class DeFiWorkflowRAG:
    """
    Retrieval-Augmented Generation system for DeFi workflow creation.
    Queries the MeTTa knowledge graph to retrieve relevant information.
    """
    
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
