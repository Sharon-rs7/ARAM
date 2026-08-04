import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from app.nlp.complaint_summarizer import generate_plain_summary

examples = [
    {
        "name": "Example A (Clear Extractable Facts)",
        "title": "Unpaid Wages Complaint",
        "description": "En company manager 4 maasam salary tharala, 80000 rs pending irukku.",
        "lang": "ta-en",
        "category": "LABOUR_DISPUTE",
        "district": "Coimbatore"
    },
    {
        "name": "Example B (Vague Complaint - No Specific Details)",
        "title": "Need legal help",
        "description": "I have a legal issue and need help.",
        "lang": "en",
        "category": "GENERAL_LEGAL_AID",
        "district": "Chennai"
    },
    {
        "name": "Example C (Native Tamil Script)",
        "title": "குடும்ப பிரச்சனை",
        "description": "என் கணவர் என்னை தினமும் தாக்குகிறார், எனக்கு பாதுகாப்பு வேண்டும்.",
        "lang": "ta",
        "category": "WOMEN_SAFETY_DOMESTIC_VIOLENCE",
        "district": "Madurai"
    }
]

print("=" * 70)
print("COMPLAINT SUMMARIZER BENCHMARK TEST (3 REAL EXAMPLES)")
print("=" * 70)

for ex in examples:
    summary = generate_plain_summary(
        title=ex["title"],
        description=ex["description"],
        language_code=ex["lang"],
        category=ex["category"],
        district=ex["district"]
    )
    print(f"\n--- {ex['name']} ---")
    print(f"Input Title:       {ex['title']}")
    print(f"Input Description: {ex['description']}")
    print(f"Language Code:     {ex['lang']}")
    print(f"Generated Summary: {summary}")
    print("-" * 70)
