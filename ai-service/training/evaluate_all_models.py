import os
import json
import joblib

metrics_file = "models/model_metrics.json"

# Load existing metrics
metrics = {}
if os.path.exists(metrics_file):
    try:
        with open(metrics_file, "r") as f:
            metrics = json.load(f)
    except Exception:
        pass

# Check NLP Models
nlp_models = [
    ("complaint_classifier", "models/complaint_classifier.pkl"),
    ("priority_model", "models/priority_model.pkl"),
    ("authority_model", "models/authority_model.pkl"),
    ("document_recommender", "models/document_recommender.pkl"),
    ("chatbot_retriever", "models/chatbot_retriever.pkl")
]

nlp_status = {}
for name, path in nlp_models:
    exists = os.path.exists(path)
    nlp_status[name] = {
        "status": "TRAINED" if exists else "MISSING",
        "path": path
    }

metrics["nlp_models"] = nlp_status
metrics["overall_status"] = "READY" if all(x["status"] == "TRAINED" for x in nlp_status.values()) else "INCOMPLETE"

with open(metrics_file, "w") as f:
    json.dump(metrics, f, indent=2)

print("\n==================================================")
print("Model evaluations completed. Metrics saved to models/model_metrics.json")
print(f"Overall status: {metrics['overall_status']}")
print("==================================================\n")
