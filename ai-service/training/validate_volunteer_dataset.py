import csv
import sys

CSV_PATH = "datasets/volunteer_matching_training.csv"

def validate():
    print("--- Starting Volunteer Matching 900-Row Dataset Validation ---")
    try:
        with open(CSV_PATH, "r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            
            # Check columns
            cols = reader.fieldnames
            required_cols = [
                "record_id", "problem_id", "problem_title", "complaint_category", "complaint_subcategory",
                "complaint_language", "priority_code", "priority_name", "urgency_definition", "women_sensitive",
                "prefer_woman_volunteer", "identity_visibility", "preferred_volunteer_gender_rule", "high_risk_signal",
                "recommended_authority", "required_documents", "required_documents_count", "volunteer_id",
                "volunteer_name", "volunteer_gender", "volunteer_languages", "volunteer_specialization_tags",
                "volunteer_district", "service_area", "availability_status", "current_active_cases",
                "max_active_cases", "workload_status", "experience_required", "volunteer_experience_level",
                "years_experience", "past_success_score", "avg_response_time_minutes", "women_support_trained",
                "can_handle_sensitive_cases", "category_match", "language_match", "district_match",
                "gender_comfort_match", "workload_available", "match_score", "match_label", "recommendation_reason"
            ]
            
            missing_cols = [c for c in required_cols if c not in cols]
            if missing_cols:
                print(f"FAIL: Missing columns: {missing_cols}")
                sys.exit(1)
                
            print("Pass: All required columns exist.")
            
            row_cnt = 0
            best_match_cnt = 0
            good_match_cnt = 0
            low_match_cnt = 0
            not_rec_cnt = 0
            sensitive_cnt = 0
            languages = set()
            
            for row in reader:
                row_cnt += 1
                
                # Check record_id
                rec_id = row["record_id"]
                if not rec_id:
                    print(f"FAIL: Empty record_id at row {row_cnt}")
                    sys.exit(1)
                    
                # Check language
                lang = row["complaint_language"]
                if lang not in ["English", "Tamil", "Hindi"]:
                    print(f"FAIL: Invalid complaint language '{lang}' at row {row_cnt}")
                    sys.exit(1)
                languages.add(lang)
                
                # Check priority
                prio_code = row["priority_code"]
                prio_name = row["priority_name"]
                if prio_code not in ["LOW", "MEDIUM", "HIGH"]:
                    print(f"FAIL: Invalid priority code '{prio_code}' at row {row_cnt}")
                    sys.exit(1)
                if prio_code == "LOW" and prio_name != "Standard Guidance":
                    print(f"FAIL: Mismatched priority name for LOW at row {row_cnt}")
                    sys.exit(1)
                if prio_code == "MEDIUM" and prio_name != "Priority Review":
                    print(f"FAIL: Mismatched priority name for MEDIUM at row {row_cnt}")
                    sys.exit(1)
                if prio_code == "HIGH" and prio_name != "Urgent Intervention":
                    print(f"FAIL: Mismatched priority name for HIGH at row {row_cnt}")
                    sys.exit(1)
                    
                # Check score and label range
                score = int(row["match_score"])
                if score < 0 or score > 100:
                    print(f"FAIL: Match score {score} out of bounds at row {row_cnt}")
                    sys.exit(1)
                    
                label = row["match_label"]
                if label == "BEST_MATCH" and (score < 90 or score > 100):
                    print(f"WARNING: Label BEST_MATCH has score {score} at row {row_cnt}")
                elif label == "GOOD_MATCH" and (score < 70 or score > 89):
                    print(f"WARNING: Label GOOD_MATCH has score {score} at row {row_cnt}")
                elif label == "LOW_MATCH" and (score < 40 or score > 69):
                    print(f"WARNING: Label LOW_MATCH has score {score} at row {row_cnt}")
                elif label == "NOT_RECOMMENDED" and (score < 0 or score > 39):
                    print(f"WARNING: Label NOT_RECOMMENDED has score {score} at row {row_cnt}")
                    
                # Count labels
                if label == "BEST_MATCH":
                    best_match_cnt += 1
                elif label == "GOOD_MATCH":
                    good_match_cnt += 1
                elif label == "LOW_MATCH":
                    low_match_cnt += 1
                elif label == "NOT_RECOMMENDED":
                    not_rec_cnt += 1
                    
                # Check sensitive gender rules
                is_sensitive = row["women_sensitive"] == "true"
                if is_sensitive:
                    sensitive_cnt += 1
                    vol_gender = row["volunteer_gender"]
                    vol_trained = row["women_support_trained"] == "true"
                    comfort_match = row["gender_comfort_match"] == "true"
                    
                    if vol_gender == "MALE" or not vol_trained:
                        if comfort_match:
                            print(f"WARNING: MALE or untrained volunteer marked comfort_match = true for sensitive case at row {row_cnt}")
                        if label == "BEST_MATCH":
                            print(f"WARNING: BEST_MATCH assigned to MALE/untrained volunteer for sensitive case at row {row_cnt}")
                            
            if row_cnt != 900:
                print(f"FAIL: Row count is {row_cnt}, expected exactly 900.")
                sys.exit(1)
                
            print("Pass: All rows validated successfully.")
            print(f"Total Rows: {row_cnt}")
            print(f"Languages: {list(languages)}")
            print(f"Women-sensitive records: {sensitive_cnt}")
            print(f"BEST_MATCH count: {best_match_cnt}")
            print(f"GOOD_MATCH count: {good_match_cnt}")
            print(f"LOW_MATCH count: {low_match_cnt}")
            print(f"NOT_RECOMMENDED count: {not_rec_cnt}")
            print("--- Validation Complete: SUCCESS ---")
            
    except Exception as e:
        print(f"FAIL: Exception raised during validation: {e}")
        sys.exit(1)

if __name__ == "__main__":
    validate()
