# ChainScore Protocol - GenLayer Intelligent Contract
# On-chain Reputation Scoring Protocol

from genlayer import *
import json

@gl.contract
class ChainScore:
    """
    On-chain Reputation Scoring Protocol
    - Query fee: Free (configurable)
    - AI consensus scoring
    - Score caching
    """
    
    def __init__(self):
        self.scores = {}
        self.query_count = 0
        self.fee_collected = 0
        self.owner = gl.msg_sender()
        self.query_fee = 0
        self.cache_duration = 86400
    
    @gl.public.view
    def get_query_fee(self) -> int:
        return self.query_fee
    
    @gl.public.view
    def get_cached_score(self, address: str) -> dict:
        addr = address.lower()
        if addr in self.scores:
            data = self.scores[addr]
            if gl.block_timestamp() - data.get("timestamp", 0) < self.cache_duration:
                return data
        return {"error": "no_cache", "message": "No cached score available"}
    
    @gl.public.view
    def get_stats(self) -> dict:
        return {
            "total_queries": self.query_count,
            "unique_addresses": len(self.scores),
            "fee_collected": self.fee_collected,
            "query_fee": self.query_fee
        }
    
    @gl.public.write
    async def calculate_score(self, address: str) -> dict:
        if gl.msg_value() < self.query_fee:
            return {
                "error": "insufficient_payment",
                "message": "Payment failed",
                "required": self.query_fee,
                "received": gl.msg_value()
            }
        
        address = address.lower()
        self.query_count += 1
        self.fee_collected += gl.msg_value()
        
        wallet_data = await self._fetch_wallet_data(address)
        
        if "error" in wallet_data:
            return wallet_data
        
        score_result = await self._ai_analyze(address, wallet_data)
        self.scores[address] = score_result
        
        return score_result
    
    async def _fetch_wallet_data(self, address: str) -> dict:
        try:
            balance_url = f"https://api.etherscan.io/api?module=account&action=balance&address={address}&tag=latest"
            balance_resp = await gl.get_webpage(balance_url)
            
            tx_url = f"https://api.etherscan.io/api?module=account&action=txlist&address={address}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc"
            tx_resp = await gl.get_webpage(tx_url)
            
            token_url = f"https://api.etherscan.io/api?module=account&action=tokentx&address={address}&page=1&offset=30&sort=desc"
            token_resp = await gl.get_webpage(token_url)
            
            return {
                "address": address,
                "balance": balance_resp,
                "transactions": tx_resp,
                "tokens": token_resp
            }
        except Exception as e:
            return {"error": "fetch_failed", "message": str(e)}
    
    async def _ai_analyze(self, address: str, data: dict) -> dict:
        prompt = f"""
Analyze this Ethereum wallet's on-chain credit status.

Wallet: {address}
Data: {json.dumps(data, ensure_ascii=False)[:4000]}

Scoring dimensions (0-100 each):
1. asset_health - Asset Health (25%): Balance, stablecoins, diversity
2. tx_activity - Transaction Activity (20%): Frequency, volume, counterparties
3. defi_engagement - DeFi Engagement (25%): Lending, LP, protocol interactions
4. account_maturity - Account Maturity (15%): Age, active days
5. governance - Governance Participation (15%): Voting, proposals

Also evaluate Sybil risk (low/medium/high).

Return strictly in JSON format, no other text:
{{
  "total_score": 0-100 integer,
  "grade": "A/B/C/D/F",
  "dimensions": {{
    "asset_health": score,
    "tx_activity": score,
    "defi_engagement": score,
    "account_maturity": score,
    "governance": score
  }},
  "sybil_risk": "low/medium/high",
  "summary": "One sentence summary",
  "highlights": ["highlight1", "highlight2"],
  "concerns": ["concern1"]
}}
"""
        
        result = await gl.eq_principle_prompt_comparative(prompt)
        
        try:
            if isinstance(result, str):
                result = result.strip()
                if "```" in result:
                    result = result.split("```")[1]
                    if result.startswith("json"):
                        result = result[4:]
                result = json.loads(result.strip())
            
            result["address"] = address
            result["timestamp"] = gl.block_timestamp()
            result["block"] = gl.block_number()
            result["fee_paid"] = gl.msg_value()
            
            return result
            
        except:
            return {
                "address": address,
                "total_score": 50,
                "grade": "C",
                "dimensions": {
                    "asset_health": 50,
                    "tx_activity": 50,
                    "defi_engagement": 50,
                    "account_maturity": 50,
                    "governance": 50
                },
                "sybil_risk": "medium",
                "summary": "Analysis in progress, please retry later",
                "highlights": [],
                "concerns": ["Analysis incomplete"],
                "timestamp": gl.block_timestamp(),
                "block": gl.block_number(),
                "fee_paid": gl.msg_value()
            }
    
    @gl.public.write
    def set_fee(self, new_fee: int):
        if gl.msg_sender() != self.owner:
            return {"error": "unauthorized"}
        self.query_fee = new_fee
        return {"success": True, "new_fee": new_fee}
    
    @gl.public.write
    def withdraw(self, amount: int, to: str):
        if gl.msg_sender() != self.owner:
            return {"error": "unauthorized"}
        return {"success": True, "amount": amount, "to": to}
