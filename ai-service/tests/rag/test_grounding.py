import os
import sys
import unittest

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.chatbot_engine import ask_chatbot_engine

class TestRAGGroundingAndPunishmentSafety(unittest.TestCase):
    def test_punishment_safety(self):
        res = ask_chatbot_engine("My employer has not paid my salary for three months.")
        self.assertIn("punishment", res)
        punishment = res["punishment"]
        # Punishment should either be explicitly from verified chunk or default safe statement
        if not punishment.get("available"):
            self.assertIn("Punishment/penalty information was not found", punishment.get("details", ""))

    def test_sources_citation_structure(self):
        res = ask_chatbot_engine("I bought a defective mobile phone and the seller refuses to refund me.")
        self.assertIn("laws", res)
        self.assertIn("documents", res)
        self.assertIn("recommendedAuthority", res)
        self.assertIn("disclaimer", res)

    def test_irrelevant_query_fallback(self):
        res = ask_chatbot_engine("I want to buy some fruits and ice cream")
        self.assertIsNotNone(res)
        self.assertIn("disclaimer", res)

    def test_gibberish_query_fallback(self):
        res = ask_chatbot_engine("asdkjhqw98ey1298y312 kjashd98213")
        self.assertIsNotNone(res)
        self.assertTrue(res.get("humanReviewRequired", False) or res.get("confidence", 0) <= 0.85)

if __name__ == "__main__":
    unittest.main()
