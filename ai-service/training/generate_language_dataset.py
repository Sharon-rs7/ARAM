import csv
import os

def generate_dataset():
    # Base sentences for English (en)
    en_base = [
        "my company has not paid my salary for two months",
        "i want to register a consumer complaint against the seller",
        "online fraud stole ten thousand rupees via upi scanner",
        "husband beats me daily and demands dowry harassment",
        "police refused to register my fir for stolen bike",
        "employee contract was terminated without prior notice",
        "need legal advice regarding property partition dispute with neighbor",
        "women safety concern and domestic violence reporting",
        "cyber crime cell help for otp banking scam",
        "retail store refused to refund money for defective product",
        "unpaid wages from my textile employer for a long time",
        "landlord is threatening to evict me without notice",
        "stolen money through internet banking phishing link",
        "illegal construction by neighbor on my side of land",
        "physical assault and threat by local goons",
        "need free legal representative for labor court",
        "refund delay on e-commerce transaction refund status",
        "sexual harassment at workplace by senior executive",
        "fraudulent call pretending to be bank manager took money",
        "wrongful termination from service without pay"
    ]

    # Base sentences for Tamil (ta)
    ta_base = [
        "என் சம்பளம் இரண்டு மாதமாக தரவில்லை என்ன செய்வது",
        "நுகர்வோர் நீதிமன்றத்தில் புகார் அளிக்க வேண்டும்",
        "ஆன்லைன் மோசடி மூலம் பணம் திருடப்பட்டது",
        "என் கணவர் என்னை தினமும் அடிக்கிறார் வரதட்சணை கொடுமை",
        "காவல் நிலையத்தில் மோட்டார் சைக்கிள் திருட்டு பற்றி எஃப்ஐஆர் பதிவு செய்யவில்லை",
        "வேலை நீக்கம் செய்யப்பட்டதற்கான இழப்பீடு வேண்டும்",
        "பக்கத்து வீட்டுக்காரருடன் நில எல்லை தகராறு உள்ளது",
        "பெண்கள் பாதுகாப்பு மற்றும் குடும்ப வன்முறை புகார்",
        "வங்கி கணக்கு விவரங்கள் திருடப்பட்டு பணம் எடுக்கப்பட்டது",
        "பழுதடைந்த பொருளுக்கு கடைக்காரர் பணம் திருப்பி தர மறுக்கிறார்",
        "ஜவுளி மில் முதலாளி சம்பளம் தர மறுக்கிறார்",
        "வீட்டு உரிமையாளர் என்னை முன்அறிவிப்பு இன்றி காலி செய்ய சொல்கிறார்",
        "போலி இணையதளத்தில் பணத்தை இழந்துவிட்டேன்",
        "அத்துமீறி எனது நிலத்தில் வேலி அமைத்துள்ளனர்",
        "உடல் ரீதியாக தாக்கி கொலை மிரட்டல் விடுக்கின்றனர்",
        "இலவச வழக்கறிஞர் உதவி பெற விண்ணப்பிப்பது எப்படி",
        "பொருள் வாங்கினோம் ஆனால் ரீஃபண்ட் தரவில்லை",
        "வேலை செய்யும் இடத்தில் பாலியல் தொல்லை தருகின்றனர்",
        "வங்கி கணக்கில் இருந்து திருட்டு தனமாக பணம் எடுக்கப்பட்டுள்ளது",
        "காரணமின்றி வேலையிலிருந்து நீக்கிவிட்டனர்"
    ]

    # Base sentences for Hindi (hi)
    hi_base = [
        "मेरी कंपनी ने दो महीने से वेतन नहीं दिया है",
        "मैं विक्रेता के खिलाफ उपभोक्ता शिकायत दर्ज करना चाहता हूं",
        "यूपीआई स्कैनर के जरिए ऑनलाइन धोखाधड़ी से पैसे चोरी हो गए",
        "पति रोज मेरे साथ मारपीट करता है और दहेज मांगता है",
        "पुलिस ने चोरी हुई बाइक की प्राथमिकी दर्ज करने से इनकार कर दिया",
        "बिना किसी सूचना के नौकरी से निकाल दिया गया है",
        "पड़ोसी के साथ संपत्ति विवाद के संबंध में कानूनी सलाह चाहिए",
        "महिला सुरक्षा और घरेलू हिंसा की शिकायत",
        "ओटीपी बैंकिंग घोटाले में साइबर सेल की मदद चाहिए",
        "दुकानदार ने खराब उत्पाद के लिए पैसे वापस करने से मना कर दिया",
        "कंपनी मालिक सैलरी देने से मना कर रहा है",
        "मकान मालिक बिना नोटिस के घर खाली करवा रहा है",
        "फिशिंग लिंक पर क्लिक करने से बैंक खाता खाली हो गया",
        "पड़ोसी ने हमारी जमीन पर अवैध कब्जा कर लिया है",
        "मारपीट और जान से मारने की धमकी मिल रही है",
        "मुफ्त सरकारी वकील के लिए कैसे आवेदन करें",
        "सामान वापस करने पर भी पैसे रिफंड नहीं मिले",
        "ऑफिस में वरिष्ठ अधिकारियों द्वारा उत्पीड़न",
        "क्रेडिट कार्ड धोखाधड़ी के कारण पैसे कट गए",
        "बिना कारण नौकरी से हटाने पर मुआवजा चाहिए"
    ]

    # Base sentences for Tanglish (ta-en)
    ta_en_base = [
        "enaku salary rendu maasam kudukala enna panradhu",
        "consumer court-la complaint panna help venum",
        "online fraud la upi vazhiya 10000 ruba thiruttupochu",
        "en purushan enna dhinamum adikiraaru dowry ketu thontharavu",
        "police station-la bike thiruttu fir register panna matenguranga",
        "work-la irundhu sudden-ah thookitanga compensation kidaikuma",
        "pakkathu veetukararoda land boundary prachana legal advice venum",
        "women safety domestic violence complaint panna iruken",
        "bank account hack aagi kaasu poiduchu cyber cell help venum",
        "damaged product kuduthutu shopkeeper cash return panna matenguraru",
        "mill owner salary thara matenguran keta miratturan",
        "house owner sudden-ah veeta empty panna solran",
        "fake website-la net banking panni kaasu pochu",
        "enga nelathula fence pottu occupy pannikittanga",
        "adichu murder threat tharanga police help venum",
        "free lawyer apply panna enna vazhi nu sollunga",
        "washing machine repair keta replacement thara matenguranga",
        "office-la sexual harassment prachana iruku",
        "bank manager nu solli otp kettu kaasu eduthutanga",
        "reason illama work-la irundhu sudden termination"
    ]

    # Base sentences for Hinglish (hi-en)
    hi_en_base = [
        "mujhe salary do mahine se nahi mili kya karu",
        "seller ke khilaf consumer court me complaint karni hai",
        "online fraud se upi account se paise kat gaye",
        "husband daily mere sath maarpeet karta hai aur dahej mangta hai",
        "police bike चोरी ki fir register nahi kar rahi hai",
        "job se bina notice ke nikal diya hai compensation chahiye",
        "padosi ke sath property land dispute chal raha hai legal advice",
        "women safety and domestic violence case report karna hai",
        "bank account details hack ho gayi cyber crime cell help",
        "defective product ke liye shopkeeper refund nahi de raha hai",
        "owner salary dene se mana kar raha hai",
        "landlord bina notice ghar khali karne ko bol raha hai",
        "phishing link se bank account khali ho gaya upi fraud",
        "padosi ne hamari jameen par kabza kar liya hai",
        "marpit aur jaan se marne ki dhamki de rahe hai log",
        "free government lawyer kaise milega advice chahiye",
        "product defective hai fir bhi refund nahi mila",
        "office me manager harassment kar raha hai",
        "otp scam me credit card se paise nikal gaye",
        "bina kisi galti ke sudden termination ho gaya"
    ]

    # Prefix/Suffix variations to expand each class to 100+ samples
    variations = [
        ("", ""),
        ("please help: ", ""),
        ("urgent request: ", ""),
        ("dear sir, ", ""),
        ("complaint copy: ", ""),
        ("i want to report: ", ""),
        ("legal issue: ", ""),
        ("grievance: ", ""),
        ("", " please support me."),
        ("", " immediately action required."),
        ("", " kindly check this issue."),
        ("", " need guidance."),
        ("hello, ", " thank you.")
    ]

    dataset = []

    # Map target keys
    classes = {
        "en": en_base,
        "ta": ta_base,
        "hi": hi_base,
        "ta-en": ta_en_base,
        "hi-en": hi_en_base
    }

    for lang_code, sentences in classes.items():
        count = 0
        for sent in sentences:
            for pref, suff in variations:
                full_text = f"{pref}{sent}{suff}"
                dataset.append((full_text, lang_code))
                count += 1
                if count >= 110: # Ensure at least 110 samples per language class
                    break
            if count >= 110:
                continue

    # Write to datasets directory
    datasets_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "datasets")
    os.makedirs(datasets_dir, exist_ok=True)
    csv_path = os.path.join(datasets_dir, "language_detection_training.csv")

    with open(csv_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["text", "language_code"])
        writer.writerows(dataset)

    print(f"Generated {len(dataset)} language training rows in {csv_path}")

if __name__ == "__main__":
    generate_dataset()
