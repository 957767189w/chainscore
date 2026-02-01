# ChainScore Protocol - GenLayer Intelligent Contract
# 链上信誉评分协议 - 带收费功能

from genlayer import *
import json

@gl.contract
class ChainScore:
    """
    链上信誉评分协议
    - 查询收费：每次评分收取 GEN 代币
    - AI 共识评分
    - 评分缓存
    """
    
    def __init__(self):
        self.scores = {}           # address -> score data
        self.query_count = 0       # 总查询次数
        self.fee_collected = 0     # 收取的总费用
        self.owner = gl.msg_sender()
        
        # 配置
        self.query_fee = 100000000000000000  # 0.1 GEN (18 decimals)
        self.cache_duration = 86400          # 24小时缓存
    
    @gl.public.view
    def get_query_fee(self) -> int:
        """获取查询费用"""
        return self.query_fee
    
    @gl.public.view
    def get_cached_score(self, address: str) -> dict:
        """获取缓存的评分（免费）"""
        addr = address.lower()
        if addr in self.scores:
            data = self.scores[addr]
            # 检查缓存是否过期
            if gl.block_timestamp() - data.get("timestamp", 0) < self.cache_duration:
                return data
        return {"error": "no_cache", "message": "No cached score available"}
    
    @gl.public.view
    def get_stats(self) -> dict:
        """获取协议统计"""
        return {
            "total_queries": self.query_count,
            "unique_addresses": len(self.scores),
            "fee_collected": self.fee_collected,
            "query_fee": self.query_fee
        }
    
    @gl.public.write
    async def calculate_score(self, address: str) -> dict:
        """
        计算信用评分 - 需要支付 GEN
        
        调用时需要发送 value >= query_fee
        """
        # 验证支付
        if gl.msg_value() < self.query_fee:
            return {
                "error": "insufficient_payment",
                "message": "扣款失败",
                "required": self.query_fee,
                "received": gl.msg_value()
            }
        
        address = address.lower()
        self.query_count += 1
        self.fee_collected += gl.msg_value()
        
        # 获取链上数据
        wallet_data = await self._fetch_wallet_data(address)
        
        if "error" in wallet_data:
            # 退款逻辑（如果数据获取失败）
            # 注：实际退款需要额外处理
            return wallet_data
        
        # AI 评分
        score_result = await self._ai_analyze(address, wallet_data)
        
        # 存储结果
        self.scores[address] = score_result
        
        return score_result
    
    async def _fetch_wallet_data(self, address: str) -> dict:
        """获取钱包链上数据"""
        try:
            # ETH 余额
            balance_url = f"https://api.etherscan.io/api?module=account&action=balance&address={address}&tag=latest"
            balance_resp = await gl.get_webpage(balance_url)
            
            # 交易列表
            tx_url = f"https://api.etherscan.io/api?module=account&action=txlist&address={address}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc"
            tx_resp = await gl.get_webpage(tx_url)
            
            # ERC20 代币
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
        """AI 分析评分"""
        
        prompt = f"""
分析这个以太坊钱包的链上信用状况。

钱包: {address}
数据: {json.dumps(data, ensure_ascii=False)[:4000]}

评分维度（每项0-100分）：
1. asset_health - 资产健康度 (25%): 余额、稳定币、多样性
2. tx_activity - 交易活跃度 (20%): 频率、金额、对手方
3. defi_engagement - DeFi参与 (25%): 借贷、LP、协议交互
4. account_maturity - 账户成熟 (15%): 年龄、活跃天数
5. governance - 治理参与 (15%): 投票、提案

同时评估女巫风险（low/medium/high）。

严格按JSON格式返回，不要其他文字：
{{
  "total_score": 0-100整数,
  "grade": "A/B/C/D/F",
  "dimensions": {{
    "asset_health": 分数,
    "tx_activity": 分数,
    "defi_engagement": 分数,
    "account_maturity": 分数,
    "governance": 分数
  }},
  "sybil_risk": "low/medium/high",
  "summary": "一句话总结",
  "highlights": ["亮点1", "亮点2"],
  "concerns": ["风险1"]
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
                "summary": "数据分析中，请稍后重试",
                "highlights": [],
                "concerns": ["分析未完成"],
                "timestamp": gl.block_timestamp(),
                "block": gl.block_number(),
                "fee_paid": gl.msg_value()
            }
    
    # ===== 管理函数 =====
    
    @gl.public.write
    def set_fee(self, new_fee: int):
        """设置查询费用（仅owner）"""
        if gl.msg_sender() != self.owner:
            return {"error": "unauthorized"}
        self.query_fee = new_fee
        return {"success": True, "new_fee": new_fee}
    
    @gl.public.write
    def withdraw(self, amount: int, to: str):
        """提取收入（仅owner）"""
        if gl.msg_sender() != self.owner:
            return {"error": "unauthorized"}
        # 实际提款逻辑
        return {"success": True, "amount": amount, "to": to}
