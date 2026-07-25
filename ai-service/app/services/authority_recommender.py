import json
import os

class AuthorityRecommender:
    def __init__(self):
        self.templates_path = "datasets/legal_problem_templates.json"
        self.templates = []
        if os.path.exists(self.templates_path):
            try:
                with open(self.templates_path, "r", encoding="utf-8") as f:
                    self.templates = json.load(f)
            except Exception as e:
                print(f"Error loading legal templates in AuthorityRecommender: {e}")

    def recommend(self, text: str, category: str) -> str:
        # Search for subcategory match
        normalized = text.lower()
        best_match = None
        highest_score = 0

        for temp in self.templates:
            if temp["category"] == category:
                keywords = temp["languageKeywords"].get("English", []) + temp["languageKeywords"].get("Tamil", [])
                score = sum(1 for kw in keywords if kw in normalized)
                if score > highest_score:
                    highest_score = score
                    best_match = temp

        if best_match and best_match["recommendedAuthority"]:
            return best_match["recommendedAuthority"]

        # Default fallback map
        authority_map = {
            "LABOUR_DISPUTE": "Labour Office",
            "CONSUMER_COMPLAINT": "Consumer Forum",
            "CYBER_CRIME": "Cyber Crime Portal",
            "PROPERTY_DISPUTE": "Police Station",
            "WOMEN_SAFETY": "Women Helpline",
            "DOMESTIC_VIOLENCE": "Protection Officer",
            "CRIMINAL_COMPLAINT": "Police Station",
            "FAMILY_DISPUTE": "Civil Court",
            "GOVERNMENT_SCHEME": "Government Grievance Cell",
            "GENERAL_LEGAL_AID": "District Legal Services Authority",
            "MOTOR_ACCIDENT_CLAIM": "Motor Accident Claims Tribunal",
            "INSURANCE_CLAIM": "Insurance Ombudsman",
            "BANKING_DISPUTE": "Banking Ombudsman",
            "RENT_TENANT_DISPUTE": "Rent Controller Office",
            "MEDICAL_NEGLIGENCE": "State Medical Council",
            "EDUCATION_DISPUTE": "Education Department Office",
            "WORKPLACE_HARASSMENT": "Internal Complaints Committee",
            "SENIOR_CITIZEN_ABUSE": "Social Welfare Officer",
            "CHILD_WELFARE": "Child Welfare Committee",
            "DISABILITY_RIGHTS": "Differently Abled Commissioner Office",
            "CASTE_DISCRIMINATION": "District Collector Office",
            "POLICE_MISCONDUCT": "District Collector Office",
            "CORRUPTION_BRIBERY": "Vigilance and Anti-Corruption Bureau",
            "CIVIC_INFRASTRUCTURE": "Municipal Corporation Grievance Cell",
            "RTI_APPLICATION": "Public Information Officer"
        }
        return authority_map.get(category, "District Legal Services Authority")

authority_recommender = AuthorityRecommender()
