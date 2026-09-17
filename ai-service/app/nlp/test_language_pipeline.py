import sys
import os

# Adjust path to import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.nlp.ml_language_detector import ml_language_detector

# Define the 60 test cases
TAMIL_TESTS = [
    "என் சம்பளம் இன்னும் வரவில்லை, முதலாளி ஏமாற்றுகிறார்.",
    "நில ஆக்கிரமிப்பு பிரச்சனைக்கு உதவி தேவை.",
    "வரதட்சணை கொடுமை மற்றும் குடும்ப வன்முறைக்கு தீர்வு வேண்டும்.",
    "சைபர் மோசடி மூலம் என் பணம் திருடப்பட்டது.",
    "வட்டார சட்ட சேவை மையத்தின் முகவரி என்ன?",
    "சாலை மற்றும் கழிவுநீர் பிரச்சனை குறித்து புகார் அளிக்கிறேன்.",
    "போலீஸ் எப்ஐஆர் பதிவு செய்ய மறுக்கிறது.",
    "வேலை செய்யும் இடத்தில் எனக்கு தொல்லை தருகிறார்கள்.",
    "நுகர்வோர் நீதிமன்றத்தில் எவ்வாறு வழக்கு தொடருவது?",
    "என் பட்டா மற்றும் சிட்டா விவரங்களை சரிபார்க்க வேண்டும்.",
    "வாடகை ஒப்பந்தம் தொடர்பான தகராறு.",
    "வங்கி கணக்கில் இருந்து அனுமதியின்றி பணம் எடுக்கப்பட்டுள்ளது.",
    "எங்களுக்கு குப்பை அகற்றும் வசதி செய்து தரவும்.",
    "பெண்கள் உதவி எண் 181 எவ்வாறு செயல்படுகிறது?",
    "அரசு நலத்திட்டங்கள் பெறுவதற்கான தகுதி என்ன?"
]

HINDI_TESTS = [
    "मेरा वेतन पिछले तीन महीनों से नहीं मिला है।",
    "भूमि विवाद और अवैध कब्जे की शिकायत करनी है।",
    "घरेलू हिंसा के खिलाफ कानूनी कार्रवाई करनी है।",
    "मेरे साथ ऑनलाइन धोखाधड़ी हुई है और पैसे चोरी हो गए।",
    "जिला विधिक सेवा प्राधिकरण का कार्यालय कहाँ है?",
    "सड़क और नाली की समस्या का समाधान चाहिए।",
    "पुलिस हमारी प्राथमिकी दर्ज नहीं कर रही है।",
    "कार्यस्थल पर मेरे साथ दुर्व्यवहार किया जा रहा है।",
    "उपभोक्ता फोरम में शिकायत कैसे दर्ज करें?",
    "भूमि के पट्टे और खतौनी की जांच करवानी है।",
    "किराएदार और मकान मालिक के बीच विवाद।",
    "खाते से बिना अनुमति के पैसे कट गए हैं।",
    "हमारे मोहल्ले में साफ-सफाई की व्यवस्था कराएं।",
    "महिला हेल्पलाइन नंबर क्या है?",
    "सरकारी योजनाओं का लाभ लेने की प्रक्रिया क्या है?"
]

ENGLISH_TESTS = [
    "I have not received my monthly salary from the supervisor.",
    "Need urgent help with property boundaries and land encroachment.",
    "Filing a complaint regarding domestic abuse and violence.",
    "Cyber criminal stole money from my bank account via UPI scam.",
    "Where is the nearest Legal Services Committee located?",
    "Public grievance regarding poor road and broken street lights.",
    "The local police refuses to register my FIR request.",
    "I am facing harassment at my workplace by manager.",
    "How do I claim a refund for a defective product?",
    "I need to verify my land ownership deeds and records.",
    "Rental agreement dispute with my property landlord.",
    "Unauthorized transaction observed in my saving account.",
    "Municipal corporation is not clearing garbage in Anna Nagar.",
    "What protection orders are available for women safety?",
    "Is free legal aid representation available for workers?"
]

TANGLISH_TESTS = [
    "Ennoda sambalam innum tharala, romba kastaama iruku.",
    "Land encroachment prachanai kaga legal guide contact pannanum.",
    "Enaku car accident nadanthuchu, insurance claim panna help panni thanga.",
    "UPI scam la panam lost aaiduchu, 1930 call pannanuma?",
    "Veetu rent agreement issue, landlord kudukala."
]

HINGLISH_TESTS = [
    "Mera paisa scammer ne chura liya, bank transaction freeze karna hai.",
    "Zamin ka jameen vivad chal raha hai police thana me shikayat karni hai.",
    "Mujhe salary nahi mili maheene se bahut dikkat ho rahi hai.",
    "Domestic violence ke khilaf help chahiye female guide connect kijiye.",
    "Defective phone refund nahi mila seller ne warranty mana kar diya."
]

MIXED_TESTS = [
    "என் நிலம் encroached by local rowdies, need legal action.",
    "वहाँ सड़क पर street lights are completely broken since last week.",
    "சம்பளம் இன்னும் வரல, company supervisor is refusing to pay wages.",
    "Cyber safety: UPI fraud lost 25000 from account.",
    "किराएदार ने rent pay नहीं किया and refusing to vacate house."
]

def run_suite():
    passed = 0
    failed = 0
    details = []

    # Helper function to assert expected language
    def test_cases(cases, expected_lang, group_name):
        nonlocal passed, failed
        for case in cases:
            res = ml_language_detector.detect(case)
            pred_lang = res["language"]
            if pred_lang == expected_lang:
                passed += 1
                details.append(f"PASS | Group: {group_name} | Text: '{case}' | Detected: {pred_lang}")
            else:
                failed += 1
                details.append(f"FAIL | Group: {group_name} | Text: '{case}' | Detected: {pred_lang} (Expected: {expected_lang})")

    # Run tests
    test_cases(TAMIL_TESTS, "ta", "Tamil Native Script")
    test_cases(HINDI_TESTS, "hi", "Hindi Native Script")
    test_cases(ENGLISH_TESTS, "en", "English Native Script")
    test_cases(TANGLISH_TESTS, "ta", "Tanglish (Latin)")
    test_cases(HINGLISH_TESTS, "hi", "Hinglish (Latin)")
    
    # Mixed cases check:
    # 1. First mixed case has Tamil characters, must resolve to "ta"
    # 2. Second mixed case has Devanagari characters, must resolve to "hi"
    # 3. Third mixed case has Tamil characters, must resolve to "ta"
    # 4. Fourth mixed case is English/Latin, must resolve to "en" or "ta"/"hi"
    # 5. Fifth mixed case has Devanagari characters, must resolve to "hi"
    mixed_expected = ["ta", "hi", "ta", "en", "hi"]
    for i, case in enumerate(MIXED_TESTS):
        res = ml_language_detector.detect(case)
        pred_lang = res["language"]
        expected = mixed_expected[i]
        if pred_lang == expected:
            passed += 1
            details.append(f"PASS | Group: Mixed | Text: '{case}' | Detected: {pred_lang}")
        else:
            failed += 1
            details.append(f"FAIL | Group: Mixed | Text: '{case}' | Detected: {pred_lang} (Expected: {expected})")

    print(f"\n================ LANGUAGE PIPELINE TEST RESULTS ================")
    print(f"Total Tests Executed: {passed + failed}")
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Accuracy: {passed / (passed + failed) * 100:.2f}%")
    print(f"================================================================")
    
    # Print failures if any
    if failed > 0:
        print("\nFailures:")
        for d in details:
            if "FAIL" in d:
                print(d)
        sys.exit(1)
    else:
        print("All tests passed successfully!")
        sys.exit(0)

if __name__ == "__main__":
    run_suite()
