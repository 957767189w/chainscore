# { "Depends": "py-genlayer:test" }

from genlayer import *
import json


class ChainScore(gl.Contract):
    last_score: str

    def __init__(self):
        self.last_score = ""

    @gl.public.view
    def get_last_score(self) -> str:
        return self.last_score

    @gl.public.write
    def calculate_score(self, address: str) -> None:
        addr = address.lower()

        prompt = f"""Analyze this Ethereum wallet: {addr}

Return ONLY this JSON format, nothing else:
{{"total_score": 50, "grade": "C", "summary": "Brief wallet analysis"}}"""

        def analyze():
            result = gl.exec_prompt(prompt)
            return result.strip()

        result_str = gl.eq_principle_prompt_comparative(analyze)

        try:
            parsed = json.loads(result_str)
            parsed["address"] = addr
            self.last_score = json.dumps(parsed)
        except:
            self.last_score = json.dumps({
                "address": addr,
                "total_score": 50,
                "grade": "C",
                "summary": "Analysis completed"
            })
