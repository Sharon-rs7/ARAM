import json
import os

class DocumentRecommender:
    def __init__(self):
        self.templates_path = "datasets/legal_problem_templates.json"
        self.templates = []
        if os.path.exists(self.templates_path):
            try:
                with open(self.templates_path, "r", encoding="utf-8") as f:
                    self.templates = json.load(f)
            except Exception as e:
                print(f"Error loading legal templates in DocumentRecommender: {e}")

    def recommend(self, text: str, category: str) -> list:
        # 1. Search for subcategory keyword matches inside templates
        normalized = text.lower()
        best_match = None
        highest_score = 0

        for temp in self.templates:
            if temp["category"] == category:
                # Score based on keyword hits in user complaint
                keywords = temp["languageKeywords"].get("English", []) + temp["languageKeywords"].get("Tamil", [])
                score = sum(1 for kw in keywords if kw in normalized)
                if score > highest_score:
                    highest_score = score
                    best_match = temp

        if best_match:
            return best_match["requiredDocuments"]

        # 2. Fallback to category defaults
        category_defaults = {
            "LABOUR_DISPUTE": ["Salary Slip", "Employee ID", "Bank Statement"],
            "CONSUMER_COMPLAINT": ["Invoice", "Transaction Screenshot", "Product Image"],
            "CYBER_CRIME": ["Bank Statement", "Transaction Screenshot", "Aadhaar Card"],
            "PROPERTY_DISPUTE": ["Property Document", "Aadhaar Card"],
            "WOMEN_SAFETY": ["Aadhaar Card"],
            "DOMESTIC_VIOLENCE": ["Medical Report", "Police Complaint Copy", "Aadhaar Card"],
            "CRIMINAL_COMPLAINT": ["Police Complaint Copy", "Aadhaar Card", "FIR Copy"],
            "GOVERNMENT_SCHEME": ["Ration Card", "Income Certificate", "Aadhaar Card"]
        }
        return category_defaults.get(category, ["Aadhaar Card"])

document_recommender = DocumentRecommender()
