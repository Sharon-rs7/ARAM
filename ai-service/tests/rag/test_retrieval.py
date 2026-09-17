import os
import sys
import unittest

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from rag.retrieval.retriever import legal_retriever

class TestLegalRetriever(unittest.TestCase):
    def test_retriever_initialized(self):
        self.assertTrue(legal_retriever.is_ready(), "Vector retriever index should be loaded")

    def test_empty_query(self):
        res = legal_retriever.retrieve("")
        self.assertEqual(len(res.top_k_chunks), 0)
        self.assertFalse(res.has_sufficient_context)

    def test_salary_query_retrieval(self):
        res = legal_retriever.retrieve("My employer has not paid my salary for three months.")
        self.assertIsNotNone(res)
        self.assertGreater(len(res.top_k_chunks), 0)
        self.assertGreaterEqual(res.highest_score, 0.45)

    def test_consumer_query_retrieval_behavior(self):
        # Query score vs threshold validation
        res = legal_retriever.retrieve("I bought a defective mobile phone and the seller refuses to refund me.")
        self.assertIsNotNone(res)
        self.assertGreater(res.highest_score, 0.0)

if __name__ == "__main__":
    unittest.main()
