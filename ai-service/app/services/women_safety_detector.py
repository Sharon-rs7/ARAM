import json
import os

class WomenSafetyDetector:
    def __init__(self):
        self.templates_path = "datasets/legal_problem_templates.json"
        self.templates = []
        if os.path.exists(self.templates_path):
            try:
                with open(self.templates_path, "r", encoding="utf-8") as f:
                    self.templates = json.load(f)
            except Exception as e:
                print(f"Error loading legal templates in WomenSafetyDetector: {e}")

    def detect(self, text: str, category: str) -> dict:
        is_sensitive = False
        prefer_woman = False
        reason = ""

        # 1. Category check
        if category in ["WOMEN_SAFETY", "DOMESTIC_VIOLENCE", "WORKPLACE_HARASSMENT"]:
            is_sensitive = True
            prefer_woman = True
            reason = f"Flagged automatically due to sensitive category: {category}"

        # 2. Text keyword scan
        sensitive_keywords = ["harassment", "stalking", "stalk", "abused", "abuse", "beating", "beats", "violence", "force", "sexual", "molest"]
        normalized = text.lower()
        if any(w in normalized for w in sensitive_keywords):
            is_sensitive = True
            prefer_woman = True
            reason = "Sensitive keywords detected in complaint text."

        # 3. Match template gender rules
        for temp in self.templates:
            if temp["category"] == category:
                keywords = temp["languageKeywords"].get("English", []) + temp["languageKeywords"].get("Tamil", [])
                if any(kw in normalized for kw in keywords):
                    if temp["womenSensitive"]:
                        is_sensitive = True
                    if temp["preferredVolunteerGenderRule"] in ["FEMALE_PREFERRED", "FEMALE_REQUIRED_ADMIN_REVIEW"]:
                        prefer_woman = True
                        reason = f"Matching subcategory template gender rule: {temp['subcategory']}"

        return {
            "womenSensitive": is_sensitive,
            "preferWomanVolunteer": prefer_woman,
            "reason": reason
        }

women_safety_detector = WomenSafetyDetector()
