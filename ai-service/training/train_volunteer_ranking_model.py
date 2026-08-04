import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

def generate_synthetic_data(num_samples=1000):
    np.random.seed(42)
    
    # Generate random features
    cat_match = np.random.choice([0, 1], size=num_samples, p=[0.3, 0.7])
    lang_match = np.random.choice([0, 1], size=num_samples, p=[0.2, 0.8])
    dist_match = np.random.choice([0, 1], size=num_samples, p=[0.4, 0.6])
    
    capacity = np.random.choice([5, 10, 15], size=num_samples)
    workload = np.array([np.random.randint(0, cap + 1) for cap in capacity])
    
    exp_years = np.random.randint(1, 15, size=num_samples)
    avg_resp = np.random.uniform(2.0, 72.0, size=num_samples)
    success = np.random.uniform(0.5, 0.99, size=num_samples)
    
    trained = np.random.choice([0, 1], size=num_samples, p=[0.6, 0.4])
    gender_match = np.random.choice([0, 1], size=num_samples, p=[0.5, 0.5])
    sensitive_case = np.random.choice([0, 1], size=num_samples, p=[0.8, 0.2])
    past_cases = workload * 3 + np.random.randint(0, 50, size=num_samples)
    avail = np.random.choice([0, 1], size=num_samples, p=[0.1, 0.9])
    
    # Calculate score based on features
    scores = []
    for idx in range(num_samples):
        if avail[idx] == 0:
            score = 0.0
        elif workload[idx] >= capacity[idx]:
            score = 10.0 # very low priority if overloaded
        else:
            score = 30.0
            if cat_match[idx] == 1: score += 25.0
            if lang_match[idx] == 1: score += 15.0
            if dist_match[idx] == 1: score += 10.0
            if gender_match[idx] == 1: score += 10.0
            if trained[idx] == 1 and gender_match[idx] == 1: score += 5.0
            
            # workload penalty
            ratio = workload[idx] / capacity[idx]
            score -= ratio * 10.0
            
            # bonus for experience and success
            score += min(5.0, exp_years[idx] * 0.4)
            score += success[idx] * 5.0
            
        scores.append(max(0.0, min(100.0, score)))
        
    df = pd.DataFrame({
        "cat_match": cat_match,
        "lang_match": lang_match,
        "dist_match": dist_match,
        "workload": workload,
        "capacity": capacity,
        "exp_years": exp_years,
        "avg_resp": avg_resp,
        "success": success,
        "trained": trained,
        "gender_match": gender_match,
        "sensitive_case": sensitive_case,
        "past_cases": past_cases,
        "avail": avail,
        "match_quality_score": scores
    })
    
    return df

def main():
    print("--- Training Volunteer Ranking Model ---")
    df = generate_synthetic_data()
    
    X = df.drop(columns=["match_quality_score"]).values
    y = df["match_quality_score"].values
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    train_score = model.score(X_train, y_train)
    test_score = model.score(X_test, y_test)
    print(f"R2 Train Score: {train_score:.4f}")
    print(f"R2 Test Score: {test_score:.4f}")
    
    # Save model
    models_dir = "models"
    os.makedirs(models_dir, exist_ok=True)
    joblib.dump(model, os.path.join(models_dir, "volunteer_ranking_model.pkl"))
    print("Volunteer ranking model saved successfully.")

if __name__ == "__main__":
    main()
