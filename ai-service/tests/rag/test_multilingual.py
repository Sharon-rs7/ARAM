import os
import sys
import unittest

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.chatbot_engine import ask_chatbot_engine

class TestMultilingualRAG(unittest.TestCase):
    def test_tamil_retrieval_and_response(self):
        res = ask_chatbot_engine("எனது நிலத்தை பக்கத்து வீட்டுக்காரர் ஆக்கிரமிப்பு செய்துள்ளார்", language="ta")
        self.assertEqual(res.get("language"), "ta")
        self.assertTrue("பிரச்சனை" in res.get("reply", "") or "நில" in res.get("reply", ""))

    def test_hindi_retrieval_and_response(self):
        res = ask_chatbot_engine("मकान मालिक मेरी सुरक्षा राशि वापस नहीं कर रहा है", language="hi")
        self.assertEqual(res.get("language"), "hi")
        self.assertTrue("समस्या" in res.get("reply", "") or "दस्तावेज" in res.get("reply", ""))

    def test_tanglish_query(self):
        res = ask_chatbot_engine("Enoda salary 3 months ah tharala employer")
        self.assertIsNotNone(res)
        self.assertEqual(res.get("category", {}).get("name") if isinstance(res.get("category"), dict) else res.get("category"), "LABOUR_DISPUTE")

if __name__ == "__main__":
    unittest.main()
