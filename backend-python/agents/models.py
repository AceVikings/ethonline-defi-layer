"""
Shared message models for Blockscout agent communication

These models must be imported by both the Blockscout agent and any client agents
to ensure schema digest compatibility.
"""

from uagents import Model
from typing import Dict

class BlockchainQuery(Model):
    """Query model for blockchain data requests"""
    query: str
    chain_id: str = "8453"  # Default to Base mainnet
    address: str = ""

class BlockchainResponse(Model):
    """Response model from blockchain queries"""
    success: bool
    data: Dict = {}
    error: str = ""
