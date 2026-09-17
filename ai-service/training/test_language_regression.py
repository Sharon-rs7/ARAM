import os
import sys
import pytest
from fastapi.testclient import TestClient

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.main import app

client = TestClient(app)

# Core Regression Test Cases: Total 61 cases (15 Tamil, 15 Hindi, 15 English, 5 Tanglish, 5 Hinglish, 5 Mixed, 1 Failing Case)
TEST_CASES = [
    # 1. Exact Failing Case
    {
        "text": "நான் சென்னையில் ஒரு வீட்டை rentக்கு எடுத்திருந்தேன். வீட்டு காலி செய்து 2 மாதங்கள் ஆகிறது. நான் வீடு நல்ல நிலையில் ஒப்படைத்துவிட்டேன். ஆனால் landlord என்னுடைய ₹30,000 security deposit-ஐ இன்னும் திருப்பி கொடுக்கவில்லை. பலமுறை கேட்டும் சரியான பதில் கொடுக்கவில்லை. என்னுடைய rental agreement மற்றும் payment proof என்னிடம் உள்ளது. இந்த பிரச்சினைக்கு என்னுடைய legal rights என்ன, நான் என்ன நடவடிக்கை எடுக்க வேண்டும் என்று உதவி வேண்டும்.",
        "expected_lang": "ta-en",
        "expected_cat": "RENT_TENANT_DISPUTE"
    },
    
    # 2. Tamil Native Script (15 cases)
    {"text": "எனக்கு வேலைக்கு ஊதியம் தரவில்லை.", "expected_lang": "ta", "expected_cat": "LABOUR_DISPUTE"},
    {"text": "என் கணவர் என்னை அடிக்கிறார்.", "expected_lang": "ta", "expected_cat": "DOMESTIC_VIOLENCE"},
    {"text": "நில ஆக்கிரமிப்பு மற்றும் எல்லைப் பிரச்சனை.", "expected_lang": "ta", "expected_cat": "PROPERTY_DISPUTE"},
    {"text": "என் அண்டை வீட்டார் என்னை துன்புறுத்துகிறார்.", "expected_lang": "ta", "expected_cat": "WOMEN_SAFETY"},
    {"text": "என் நிலத்திற்கு பட்டா வேண்டும்.", "expected_lang": "ta", "expected_cat": "PROPERTY_DISPUTE"},
    {"text": "லஞ்சம் கேட்கிறார்கள் அரசு அலுவலகத்தில்.", "expected_lang": "ta", "expected_cat": "CORRUPTION_BRIBERY"},
    {"text": "வாரிசு சான்றிதழ் கிடைக்கவில்லை.", "expected_lang": "ta", "expected_cat": "FAMILY_DISPUTE"},
    {"text": "விபத்து இழப்பீடு கோர வேண்டும்.", "expected_lang": "ta", "expected_cat": "MOTOR_ACCIDENT_CLAIM"},
    {"text": "பள்ளி கல்வி கட்டணம் அதிகம்.", "expected_lang": "ta", "expected_cat": "EDUCATION_DISPUTE"},
    {"text": "முதியோர் உதவித்தொகை வரவில்லை.", "expected_lang": "ta", "expected_cat": "SENIOR_CITIZEN_ABUSE"},
    {"text": "அரசு இலவச வீட்டுமனை திட்டம்.", "expected_lang": "ta", "expected_cat": "GOVERNMENT_SCHEME"},
    {"text": "குடிநீர் வசதி இல்லை தெருவில்.", "expected_lang": "ta", "expected_cat": "CIVIC_INFRASTRUCTURE"},
    {"text": "தெருவிளக்கு எரியவில்லை எங்கள் பகுதியில்.", "expected_lang": "ta", "expected_cat": "CIVIC_INFRASTRUCTURE"},
    {"text": "காவல் நிலையத்தில் புகார் பதிவு செய்யவில்லை.", "expected_lang": "ta", "expected_cat": "POLICE_MISCONDUCT"},
    {"text": "மருத்துவமனையில் தவறான சிகிச்சை.", "expected_lang": "ta", "expected_cat": "MEDICAL_NEGLIGENCE"},

    # 3. Hindi Native Script (15 cases)
    {"text": "मालिक ने मुझे वेतन नहीं दिया।", "expected_lang": "hi", "expected_cat": "LABOUR_DISPUTE"},
    {"text": "मेरे पति मुझे मारते हैं और प्रताड़ित करते हैं।", "expected_lang": "hi", "expected_cat": "DOMESTIC_VIOLENCE"},
    {"text": "जमीन का विवाद है और सीमा पर कब्ज़ा कर लिया है।", "expected_lang": "hi", "expected_cat": "PROPERTY_DISPUTE"},
    {"text": "सरकारी दफ्तर में रिश्वत मांगी जा रही है।", "expected_lang": "hi", "expected_cat": "CORRUPTION_BRIBERY"},
    {"text": "मुझे मकान खाली करने की धमकी मिल रही है।", "expected_lang": "hi", "expected_cat": "RENT_TENANT_DISPUTE"},
    {"text": "सड़क पर पानी जमा है और गड्ढे हैं।", "expected_lang": "hi", "expected_cat": "CIVIC_INFRASTRUCTURE"},
    {"text": "पुलिस एफआईआर दर्ज नहीं कर रही है।", "expected_lang": "hi", "expected_cat": "POLICE_MISCONDUCT"},
    {"text": "कार एक्सीडेंट का क्लेम चाहिए।", "expected_lang": "hi", "expected_cat": "MOTOR_ACCIDENT_CLAIM"},
    {"text": "स्कूल में जबरन फीस वसूली जा रही है।", "expected_lang": "hi", "expected_cat": "EDUCATION_DISPUTE"},
    {"text": "बुजुर्ग माता-पिता को घर से निकाल दिया।", "expected_lang": "hi", "expected_cat": "SENIOR_CITIZEN_ABUSE"},
    {"text": "राशन कार्ड पर राशन नहीं मिल रहा।", "expected_lang": "hi", "expected_cat": "GOVERNMENT_SCHEME"},
    {"text": "अस्पताल में गलत इलाज की वजह से मौत हुई।", "expected_lang": "hi", "expected_cat": "MEDICAL_NEGLIGENCE"},
    {"text": "बीमा कंपनी ने क्लेम खारिज कर दिया।", "expected_lang": "hi", "expected_cat": "INSURANCE_CLAIM"},
    {"text": "भ्रष्टाचार की शिकायत दर्ज करनी है।", "expected_lang": "hi", "expected_cat": "CORRUPTION_BRIBERY"},
    {"text": "महिला उत्पीड़न का मामला है।", "expected_lang": "hi", "expected_cat": "WOMEN_SAFETY"},

    # 4. English (15 cases)
    {"text": "The bank charged me unauthorized credit card fees.", "expected_lang": "en", "expected_cat": "BANKING_DISPUTE"},
    {"text": "My employer did not pay my salary for three months.", "expected_lang": "en", "expected_cat": "LABOUR_DISPUTE"},
    {"text": "The online seller sent me a broken product.", "expected_lang": "en", "expected_cat": "CONSUMER_COMPLAINT"},
    {"text": "I lost money to an online UPI fraud scam.", "expected_lang": "en", "expected_cat": "CYBER_CRIME"},
    {"text": "The landlord is forcing me to vacate without notice.", "expected_lang": "en", "expected_cat": "RENT_TENANT_DISPUTE"},
    {"text": "There is land boundary encroachment by neighbors.", "expected_lang": "en", "expected_cat": "PROPERTY_DISPUTE"},
    {"text": "The insurance company rejected my health claim.", "expected_lang": "en", "expected_cat": "INSURANCE_CLAIM"},
    {"text": "My car was hit by a truck and I need compensation.", "expected_lang": "en", "expected_cat": "MOTOR_ACCIDENT_CLAIM"},
    {"text": "I want to file an RTI application for details.", "expected_lang": "en", "expected_cat": "RTI_APPLICATION"},
    {"text": "The college is refusing to return my certificates.", "expected_lang": "en", "expected_cat": "EDUCATION_DISPUTE"},
    {"text": "The road in our street has huge potholes.", "expected_lang": "en", "expected_cat": "CIVIC_INFRASTRUCTURE"},
    {"text": "The municipal office is asking for a bribe.", "expected_lang": "en", "expected_cat": "CORRUPTION_BRIBERY"},
    {"text": "I am facing workplace sexual harassment by my boss.", "expected_lang": "en", "expected_cat": "WORKPLACE_HARASSMENT"},
    {"text": "My father was abandoned by my brother.", "expected_lang": "en", "expected_cat": "SENIOR_CITIZEN_ABUSE"},
    {"text": "A thief stole my mobile phone in the market.", "expected_lang": "en", "expected_cat": "CRIMINAL_COMPLAINT"},

    # 5. Tanglish (5 cases)
    {"text": "enaku velai sambalam tharala boss.", "expected_lang": "ta-en", "expected_cat": "LABOUR_DISPUTE"},
    {"text": "ennoda land boundary prachanai iruku.", "expected_lang": "ta-en", "expected_cat": "PROPERTY_DISPUTE"},
    {"text": "landlord vaadagai agreement illama vacate panna soldrar.", "expected_lang": "ta-en", "expected_cat": "RENT_TENANT_DISPUTE"},
    {"text": "husband enaku domestic violence tharrar, romba beating.", "expected_lang": "ta-en", "expected_cat": "DOMESTIC_VIOLENCE"},
    {"text": "police station la fir register panni tharala.", "expected_lang": "ta-en", "expected_cat": "POLICE_MISCONDUCT"},

    # 6. Hinglish (5 cases)
    {"text": "mujhe salary nahi mili, employer kam karwa raha hai.", "expected_lang": "hi-en", "expected_cat": "LABOUR_DISPUTE"},
    {"text": "malk ne rent agreement ke bina ghar se nikala.", "expected_lang": "hi-en", "expected_cat": "RENT_TENANT_DISPUTE"},
    {"text": "husband domestic violence kar raha hai, bohot beating hui.", "expected_lang": "hi-en", "expected_cat": "DOMESTIC_VIOLENCE"},
    {"text": "police fir register nahi kar rahi hai station me.", "expected_lang": "hi-en", "expected_cat": "POLICE_MISCONDUCT"},
    {"text": "road par paani jama hai aur municipal complaint karni hai.", "expected_lang": "hi-en", "expected_cat": "CIVIC_INFRASTRUCTURE"},

    # 7. Mixed Tamil-English Script (5 cases)
    {"text": "நான் சென்னையில் ஒரு வீட்டை rentக்கு எடுத்திருந்தேன்.", "expected_lang": "ta-en", "expected_cat": "RENT_TENANT_DISPUTE"},
    {"text": "என்னுடைய officeல் salary இன்னும் credit ஆகவில்லை.", "expected_lang": "ta-en", "expected_cat": "LABOUR_DISPUTE"},
    {"text": "என் landக்கு பட்டா மற்றும் chitta வாங்க வேண்டும்.", "expected_lang": "ta-en", "expected_cat": "PROPERTY_DISPUTE"},
    {"text": "அரசு hospitalல் சரியான medical treatment கிடைக்கவில்லை.", "expected_lang": "ta-en", "expected_cat": "MEDICAL_NEGLIGENCE"},
    {"text": "எனக்கு bank loan வட்டி விகிதம் அதிகமாக உள்ளது.", "expected_lang": "ta-en", "expected_cat": "BANKING_DISPUTE"}
]

@pytest.mark.parametrize("case", TEST_CASES)
def test_language_and_category_detection(case):
    payload = {
        "title": "",
        "description": case["text"],
        "languageHint": "en",  # Simulate Spring Boot default system hint
        "district": "Coimbatore",
        "complaintId": "test-reg-101",
        "citizenId": 12345
    }
    
    res = client.post("/complaint/analyze", json=payload, headers={"X-Internal-Token": "aram-secret-token-2026"})
    assert res.status_code == 200
    data = res.json()
    
    # 1. Assert language resolution correctness
    detected = data.get("detectedLanguage")
    assert detected == case["expected_lang"], f"Expected language '{case['expected_lang']}', but got '{detected}' for text: '{case['text']}'"
    
    # 2. Assert category mapping correctness
    cat = data.get("category")
    assert cat == case["expected_cat"], f"Expected category '{case['expected_cat']}', but got '{cat}' for text: '{case['text']}'"

    # 3. Assert genuinely trained metadata list is present and correct
    assert "categoriesGenuinelyTrained" in data
    assert "CONSUMER_COMPLAINT" in data["categoriesGenuinelyTrained"]
    assert "BANKING_DISPUTE" in data["categoriesGenuinelyTrained"]
