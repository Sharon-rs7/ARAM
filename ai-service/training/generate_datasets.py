import os
import csv
import json

# Ensure directories exist
os.makedirs("datasets", exist_ok=True)
os.makedirs("datasets/document_dataset", exist_ok=True)

# Generate folder stubs for document classifier verification
folders = [
    "SALARY_SLIP", "INVOICE", "EMPLOYEE_ID", "BANK_STATEMENT", 
    "TRANSACTION_SCREENSHOT", "PROPERTY_DOCUMENT", "MEDICAL_REPORT", 
    "POLICE_COMPLAINT_COPY", "INSURANCE_POLICY", "RENT_AGREEMENT", 
    "DISABILITY_CERTIFICATE", "COMMUNITY_CERTIFICATE", "UNKNOWN"
]
for folder in folders:
    os.makedirs(f"datasets/document_dataset/{folder}", exist_ok=True)

# 25 Categories: 10 original + 15 new real-life legal grievances
complaints_data = [
    # 1. LABOUR_DISPUTE
    ("My company did not pay my salary for 3 months.", "English", "LABOUR_DISPUTE"),
    ("Employer terminated me without notice or severance pay.", "English", "LABOUR_DISPUTE"),
    ("Ennoda office-la 3 maasamaa sambalam tharala.", "Tanglish", "LABOUR_DISPUTE"),
    ("3 மாதங்களாக என் நிறுவனம் எனக்கு சம்பளம் வழங்கவில்லை.", "Tamil", "LABOUR_DISPUTE"),
    ("முன்னறிவிப்பு இல்லாமல் வேலைநீக்கம் செய்யப்பட்டேன்.", "Tamil", "LABOUR_DISPUTE"),
    ("Company-la salary tharama delay panranga.", "Tanglish", "LABOUR_DISPUTE"),
    
    # 2. CONSUMER_COMPLAINT
    ("Bought a mobile phone online but received a soap bar.", "English", "CONSUMER_COMPLAINT"),
    ("Store refusing to honor the 1-year product warranty.", "English", "CONSUMER_COMPLAINT"),
    ("Online-la phone order panna, aana dummy box vandhuchu.", "Tanglish", "CONSUMER_COMPLAINT"),
    ("ஆன்லைனில் வாங்கிய தயாரிப்பு சேதமடைந்துள்ளது, திரும்பப் பெற மறுக்கிறார்கள்.", "Tamil", "CONSUMER_COMPLAINT"),
    ("அதிகப்படியான விலை வசூலிக்கும் கடைக்காரர்.", "Tamil", "CONSUMER_COMPLAINT"),
    ("Defective TV purchase panni response illa store la.", "Tanglish", "CONSUMER_COMPLAINT"),

    # 3. CYBER_CRIME
    ("Lost 50000 rupees due to a fake UPI QR code scam.", "English", "CYBER_CRIME"),
    ("Bank account hacked and savings transferred online.", "English", "CYBER_CRIME"),
    ("Ennoda bank account hacking aagi panam pochu.", "Tanglish", "CYBER_CRIME"),
    ("போலி ஓடிபி மூலம் எனது கணக்கிலிருந்து பணம் திருடப்பட்டது.", "Tamil", "CYBER_CRIME"),
    ("வங்கி கணக்கு ஹேக் செய்யப்பட்டு பரிவர்த்தனை நடந்துள்ளது.", "Tamil", "CYBER_CRIME"),
    ("Scam links click panni bank balance tholachuten.", "Tanglish", "CYBER_CRIME"),

    # 4. PROPERTY_DISPUTE
    ("Neighbor encroached my boundary wall and built a gate.", "English", "PROPERTY_DISPUTE"),
    ("Landlord refusing to return my security deposit.", "English", "PROPERTY_DISPUTE"),
    ("Pakkathu veetukaaran enga idathula encroaching panran.", "Tanglish", "PROPERTY_DISPUTE"),
    ("அண்டை வீட்டார் எனது நில எல்லையை ஆக்கிரமித்து கட்டியுள்ளனர்.", "Tamil", "PROPERTY_DISPUTE"),
    ("போலி பத்திரம் தயாரித்து எனது வீட்டை விற்க முயல்கிறார்கள்.", "Tamil", "PROPERTY_DISPUTE"),
    ("Patta transfer panna registration office-la legal issue.", "Tanglish", "PROPERTY_DISPUTE"),

    # 5. WOMEN_SAFETY
    ("Colleague continuously stalking and sending inappropriate texts.", "English", "WOMEN_SAFETY"),
    ("Facing verbal harassment at public bus stop daily.", "English", "WOMEN_SAFETY"),
    ("Office-la oru officer thappa pesuran, stalk panran.", "Tanglish", "WOMEN_SAFETY"),
    ("பேருந்து நிலையத்தில் ஒரு நபர் என்னைத் தொடர்ந்து பின்தொடர்கிறார்.", "Tamil", "WOMEN_SAFETY"),
    ("பணியிடத்தில் எனக்கு தொடர்ந்து பாலியல் தொல்லைகள் வருகின்றன.", "Tamil", "WOMEN_SAFETY"),
    ("Stalker follow panran evening college vitu varra vazhila.", "Tanglish", "WOMEN_SAFETY"),

    # 6. DOMESTIC_VIOLENCE
    ("Husband beats me under the influence of alcohol.", "English", "DOMESTIC_VIOLENCE"),
    ("In-laws abusing and threatening for dowry money.", "English", "DOMESTIC_VIOLENCE"),
    ("Enga veetla purushan thittamal adikiraru.", "Tanglish", "DOMESTIC_VIOLENCE"),
    ("மது குடித்துவிட்டு கணவர் தினமும் என்னை அடிக்கிறார்.", "Tamil", "DOMESTIC_VIOLENCE"),
    ("வரதட்சணை கேட்டு மாமியார் கொடுமைப்படுத்துகிறார்கள்.", "Tamil", "DOMESTIC_VIOLENCE"),
    ("Dowry pathathu nu solli purushan abusive-a nadakuran.", "Tanglish", "DOMESTIC_VIOLENCE"),

    # 7. CRIMINAL_COMPLAINT
    ("Gang attacked me with weapons near the market area.", "English", "CRIMINAL_COMPLAINT"),
    ("My motorcycle was stolen from outside my house entry.", "English", "CRIMINAL_COMPLAINT"),
    ("Market kitta gang kathi vechu adichanga.", "Tanglish", "CRIMINAL_COMPLAINT"),
    ("இரவில் வீட்டை உடைத்து தங்க நகைகள் திருடப்பட்டுள்ளன.", "Tamil", "CRIMINAL_COMPLAINT"),
    ("சாலையில் சிலர் என்னைத் தாக்கி எனது பணத்தைப் பறித்தனர்.", "Tamil", "CRIMINAL_COMPLAINT"),
    ("Gold chain robbery nadanthuchu street corner la.", "Tanglish", "CRIMINAL_COMPLAINT"),

    # 8. FAMILY_DISPUTE
    ("Filing for divorce and seeking child custody support.", "English", "FAMILY_DISPUTE"),
    ("Parents forcing me to get married against my will.", "English", "FAMILY_DISPUTE"),
    ("Divorce venum, aana baby custody thara matengranga.", "Tanglish", "FAMILY_DISPUTE"),
    ("விருப்பம் இல்லாமல் குடும்பத்தினர் திருமணம் செய்ய வற்புறுத்துகிறார்கள்.", "Tamil", "FAMILY_DISPUTE"),
    ("பூர்வீக சொத்தை பிரிப்பதில் சகோதரர்களுக்குள் தகராறு.", "Tamil", "FAMILY_DISPUTE"),
    ("Ancesty property share divide panrathula conflict.", "Tanglish", "FAMILY_DISPUTE"),

    # 9. GOVERNMENT_SCHEME
    ("Denied benefits of housing scheme despite having all eligibility.", "English", "GOVERNMENT_SCHEME"),
    ("Panchayat office demanding bribe for widow pension approval.", "English", "GOVERNMENT_SCHEME"),
    ("Housing scheme-la ellam documents irundhum select aagala.", "Tanglish", "GOVERNMENT_SCHEME"),
    ("விபத்து நிவாரணத் தொகை பெற தகுதி இருந்தும் கிடைக்கவில்லை.", "Tamil", "GOVERNMENT_SCHEME"),
    ("ரேஷன் கார்டு வழங்க அதிகாரிகள் லஞ்சம் கேட்கிறார்கள்.", "Tamil", "GOVERNMENT_SCHEME"),
    ("OAP pension scheme register panna officials reject panranga.", "Tanglish", "GOVERNMENT_SCHEME"),

    # 10. GENERAL_LEGAL_AID
    ("I need free legal advice regarding a contract discrepancy.", "English", "GENERAL_LEGAL_AID"),
    ("How to apply for free legal representation in district court.", "English", "GENERAL_LEGAL_AID"),
    ("Enaku free lawyer venum, court case pathi legal aid thairya.", "Tanglish", "GENERAL_LEGAL_AID"),
    ("இலவச சட்ட உதவி பெற எங்கு விண்ணப்பிக்க வேண்டும்?", "Tamil", "GENERAL_LEGAL_AID"),
    ("நீதிமன்ற சம்மன் வந்துள்ளது, என்ன செய்ய வேண்டும் என அறிய வேண்டும்.", "Tamil", "GENERAL_LEGAL_AID"),
    ("Free legal consultation documents apply panrathuku link enna.", "Tanglish", "GENERAL_LEGAL_AID"),

    # 11. MOTOR_ACCIDENT_CLAIM (New)
    ("Claiming compensation for severe injuries from truck collision.", "English", "MOTOR_ACCIDENT_CLAIM"),
    ("Third party insurance claim pending for car accident.", "English", "MOTOR_ACCIDENT_CLAIM"),
    ("Road accident accident compensation application block panranga.", "Tanglish", "MOTOR_ACCIDENT_CLAIM"),
    ("மோட்டார் வாகன விபத்து இழப்பீடு கோரி விண்ணப்பிக்க வேண்டும்.", "Tamil", "MOTOR_ACCIDENT_CLAIM"),
    ("இருசக்கர வாகன விபத்தில் அடிபட்டு காப்பீடு பெற முடியவில்லை.", "Tamil", "MOTOR_ACCIDENT_CLAIM"),
    ("Car damage accident claim process insurance company delayed.", "Tanglish", "MOTOR_ACCIDENT_CLAIM"),

    # 12. INSURANCE_CLAIM (New)
    ("Life insurance payout rejected due to false technical reasons.", "English", "INSURANCE_CLAIM"),
    ("Health insurance company not releasing money for surgery.", "English", "INSURANCE_CLAIM"),
    ("Insurance claim deny pannitanga documentation complete-a irundhum.", "Tanglish", "INSURANCE_CLAIM"),
    ("மருத்துவக் காப்பீட்டுத் தொகையை நிறுவனம் வழங்க மறுக்கிறது.", "Tamil", "INSURANCE_CLAIM"),
    ("பயிர்க் காப்பீட்டுத் தொகை கிடைக்காமல் விவசாயிகள் தவிக்கிறார்கள்.", "Tamil", "INSURANCE_CLAIM"),
    ("Crop insurance failure payout delay by corporate agent.", "Tanglish", "INSURANCE_CLAIM"),

    # 13. BANKING_DISPUTE (New)
    ("Unauthorized credit card transaction charges billed to account.", "English", "BANKING_DISPUTE"),
    ("Bank frozen my account without sending any written notice.", "English", "BANKING_DISPUTE"),
    ("Bank account unauthorized charge cut pannitanga return tharala.", "Tanglish", "BANKING_DISPUTE"),
    ("எனது அனுமதியின்றி வங்கிக் கணக்கிலிருந்து பணம் எடுக்கப்பட்டுள்ளது.", "Tamil", "BANKING_DISPUTE"),
    ("வங்கிக் கடன் வட்டி விகிதத்தில் மோசடி செய்துள்ளனர்.", "Tamil", "BANKING_DISPUTE"),
    ("Personal loan EMI extra auto debit dispute with manager.", "Tanglish", "BANKING_DISPUTE"),

    # 14. RENT_TENANT_DISPUTE (New)
    ("Landlord attempting illegal eviction without notice window.", "English", "RENT_TENANT_DISPUTE"),
    ("Tenant not paying rent and refusing to vacate building.", "English", "RENT_TENANT_DISPUTE"),
    ("House owner room lease advance return tharama vacate panna soldran.", "Tanglish", "RENT_TENANT_DISPUTE"),
    ("வாடகை ஒப்பந்தம் முடியும் முன்பே வீட்டை விட்டு வெளியேறச் சொல்கிறார்.", "Tamil", "RENT_TENANT_DISPUTE"),
    ("வாடகை தராமல் வீட்டை ஆக்கிரமித்துள்ள வாடகைதாரர்.", "Tamil", "RENT_TENANT_DISPUTE"),
    ("Rental agreement renewal dispute tenant refusing to exit.", "Tanglish", "RENT_TENANT_DISPUTE"),

    # 15. MEDICAL_NEGLIGENCE (New)
    ("Doctor left surgical gauze inside patient body after surgery.", "English", "MEDICAL_NEGLIGENCE"),
    ("Wrong medication dosage caused severe brain damage to child.", "English", "MEDICAL_NEGLIGENCE"),
    ("Hospital wrong injection wrong treatment patient death negligence.", "Tanglish", "MEDICAL_NEGLIGENCE"),
    ("மருத்துவரின் அலட்சியத்தால் அறுவை சிகிச்சை தோல்வி அடைந்தது.", "Tamil", "MEDICAL_NEGLIGENCE"),
    ("தவறான மருந்து வழங்கியதால் நோயாளிக்கு பக்கவாதம் ஏற்பட்டது.", "Tamil", "MEDICAL_NEGLIGENCE"),
    ("Government hospital delivery operation negligence of duty doctor.", "Tanglish", "MEDICAL_NEGLIGENCE"),

    # 16. EDUCATION_DISPUTE (New)
    ("College refusing to return original certificates upon exit.", "English", "EDUCATION_DISPUTE"),
    ("Private school demanding capitation fee violating RTE Act.", "English", "EDUCATION_DISPUTE"),
    ("RTE admission block school extra fee demand panranga.", "Tanglish", "EDUCATION_DISPUTE"),
    ("கல்லூரி மாற்றுச் சான்றிதழை தர மறுத்து அலைக்கழிக்கிறது.", "Tamil", "EDUCATION_DISPUTE"),
    ("அனுமதி பெறாத பள்ளியில் சேர்ந்து மாணவர்கள் ஏமாற்றம் அடைந்தனர்.", "Tamil", "EDUCATION_DISPUTE"),
    ("Scholarship application process college staff bribe demanding.", "Tanglish", "EDUCATION_DISPUTE"),

    # 17. WORKPLACE_HARASSMENT (New)
    ("Supervisor threatening termination for refusing sexual advances.", "English", "WORKPLACE_HARASSMENT"),
    ("Abusive toxic manager creating hostile environment at office.", "English", "WORKPLACE_HARASSMENT"),
    ("Office management toxic pressure workplace mental harassment.", "Tanglish", "WORKPLACE_HARASSMENT"),
    ("பணியிடத்தில் பெண் ஊழியர்களுக்கு தொடர்ந்து பாலியல் அச்சுறுத்தல்.", "Tamil", "WORKPLACE_HARASSMENT"),
    ("மேலதிகாரி தகாத வார்த்தைகளால் பேசி அவமதிக்கிறார்.", "Tamil", "WORKPLACE_HARASSMENT"),
    ("Salary cut threaten HR harassment workplace safety failure.", "Tanglish", "WORKPLACE_HARASSMENT"),

    # 18. SENIOR_CITIZEN_ABUSE (New)
    ("Children abandoned parents and grabbed all pension property.", "English", "SENIOR_CITIZEN_ABUSE"),
    ("Physical abuse and starvation of elderly father by son.", "English", "SENIOR_CITIZEN_ABUSE"),
    ("Elderly mother property sign register panni thurathitaanga children.", "Tanglish", "SENIOR_CITIZEN_ABUSE"),
    ("முதியோர் உதவித்தொகையை பறித்துக் கொண்டு மகன் வீட்டை விட்டு துரத்தினார்.", "Tamil", "SENIOR_CITIZEN_ABUSE"),
    ("வயதான பெற்றோரை கவனித்துக் கொள்ளாமல் பிள்ளைகள் கைவிட்டனர்.", "Tamil", "SENIOR_CITIZEN_ABUSE"),
    ("Maintenance claim against son senior citizen protection act help.", "Tanglish", "SENIOR_CITIZEN_ABUSE"),

    # 19. CHILD_WELFARE (New)
    ("Reporting active child labor in local tea shop market.", "English", "CHILD_WELFARE"),
    ("Minor girl forced into child marriage arrangement by relatives.", "English", "CHILD_WELFARE"),
    ("Child labor hotel work street child welfare rescue help.", "Tanglish", "CHILD_WELFARE"),
    ("குழந்தை தொழிலாளர்களை கடைகளில் வேலைக்கு வைத்துள்ளனர்.", "Tamil", "CHILD_WELFARE"),
    ("மைனர் சிறுமிக்கு கட்டாயத் திருமணம் செய்ய ஏற்பாடு நடக்கிறது.", "Tamil", "CHILD_WELFARE"),
    ("School dropout child labor brick kiln factory minor abuse.", "Tanglish", "CHILD_WELFARE"),

    # 20. DISABILITY_RIGHTS (New)
    ("Denied accessibility ramps in public government bank office.", "English", "DISABILITY_RIGHTS"),
    ("Employer rejected job application solely due to visual impairment.", "English", "DISABILITY_RIGHTS"),
    ("Differently abled quota job skip reservation violations office.", "Tanglish", "DISABILITY_RIGHTS"),
    ("மாற்றுத்திறனாளிகளுக்கான அரசு சலுகைகள் மற்றும் வேலைவாய்ப்பு மறுப்பு.", "Tamil", "DISABILITY_RIGHTS"),
    ("பள்ளி வளாகத்தில் மாற்றுத்திறனாளி மாணவர்களுக்கு கழிப்பறை வசதி இல்லை.", "Tamil", "DISABILITY_RIGHTS"),
    ("Disability certificate application issue welfare card delayed.", "Tanglish", "DISABILITY_RIGHTS"),

    # 21. CASTE_DISCRIMINATION (New)
    ("Social boycott of SC community from local village temple festival.", "English", "CASTE_DISCRIMINATION"),
    ("Casteist slurs thrown at water well community sharing point.", "English", "CASTE_DISCRIMINATION"),
    ("Caste name calling discrimination tea shop separate glass.", "Tanglish", "CASTE_DISCRIMINATION"),
    ("பட்டியலின மக்களை பொதுக் கிணற்றில் தண்ணீர் எடுக்க விடாமல் தடுக்கிறார்கள்.", "Tamil", "CASTE_DISCRIMINATION"),
    ("சாதிப் பெயரைச் சொல்லி இழிவுபடுத்தி ஊரை விட்டு ஒதுக்கி வைத்தனர்.", "Tamil", "CASTE_DISCRIMINATION"),
    ("Caste barrier temple entry village panchayat discrimination.", "Tanglish", "CASTE_DISCRIMINATION"),

    # 22. POLICE_MISCONDUCT (New)
    ("Police officer refused to register FIR for a theft case.", "English", "POLICE_MISCONDUCT"),
    ("Illegal police detention and custodial violence in lockup.", "English", "POLICE_MISCONDUCT"),
    ("Police custody beating bribe demand local FIR registration fail.", "Tanglish", "POLICE_MISCONDUCT"),
    ("காவல் துறையினர் புகார் மனுவை வாங்க மறுத்து திருப்பி அனுப்பினர்.", "Tamil", "POLICE_MISCONDUCT"),
    ("விசாரணை என்ற பெயரில் லாக்அப்பில் வைத்து கடுமையாக தாக்கினர்.", "Tamil", "POLICE_MISCONDUCT"),
    ("False case threat bribery police station lockup assault.", "Tanglish", "POLICE_MISCONDUCT"),

    # 23. CORRUPTION_BRIBERY (New)
    ("Public officer demanding bribe of 5000 for death certificate.", "English", "CORRUPTION_BRIBERY"),
    ("Contractor paying kickbacks to municipal engineer for road works.", "English", "CORRUPTION_BRIBERY"),
    ("Bribe demand office corruption latcham registration patta.", "Tanglish", "CORRUPTION_BRIBERY"),
    ("அரசு அலுவலகத்தில் ஓட்டுநர் உரிமம் பெற லஞ்சம் கேட்கிறார்கள்.", "Tamil", "CORRUPTION_BRIBERY"),
    ("பில் பாஸ் செய்ய இன்ஜினியர் பெருந்தொகை லஞ்சம் கேட்கிறார்.", "Tamil", "CORRUPTION_BRIBERY"),
    ("Vigilance anti corruption bribe recording complaint help.", "Tanglish", "CORRUPTION_BRIBERY"),

    # 24. CIVIC_INFRASTRUCTURE (New)
    ("Broken sewage pipe causing raw sewage drinking water mix.", "English", "CIVIC_INFRASTRUCTURE"),
    ("Severe potholes on main road causing fatal bike accidents.", "English", "CIVIC_INFRASTRUCTURE"),
    ("Street light repair block dark street chain snatching threat.", "Tanglish", "CIVIC_INFRASTRUCTURE"),
    ("குடிநீருடன் கழிவுநீர் கலந்து வருவதால் தொற்றுநோய் பரவுகிறது.", "Tamil", "CIVIC_INFRASTRUCTURE"),
    ("சாலையில் உள்ள ஆழமான பள்ளங்களால் வாகன ஓட்டிகள் விபத்துக்குள்ளாகிறார்கள்.", "Tamil", "CIVIC_INFRASTRUCTURE"),
    ("Garbage dumping issue street corner corporate cleaning delay.", "Tanglish", "CIVIC_INFRASTRUCTURE"),

    # 25. RTI_APPLICATION (New)
    ("RTI request regarding village budget spending not answered.", "English", "RTI_APPLICATION"),
    ("Public information officer intentionally gave wrong fake answers.", "English", "RTI_APPLICATION"),
    ("RTI reply delay timeline over no info provided by office.", "Tanglish", "RTI_APPLICATION"),
    ("தகவல் அறியும் உரிமை சட்டத்தின் கீழ் கேட்ட கேள்விக்கு பதில் அளிக்கவில்லை.", "Tamil", "RTI_APPLICATION"),
    ("அரசு திட்ட செலவு விபரங்கள் குறித்த ஆர்டிஐ மனு நிராகரிக்கப்பட்டது.", "Tamil", "RTI_APPLICATION"),
    ("PIO officer RTI appeal process documentation rejection.", "Tanglish", "RTI_APPLICATION")
]

# Expand seeds programmatically to over 700 rows
extended_complaints = []
for i in range(5):  # 5 * 150 = 750 rows
    for text, lang, cat in complaints_data:
        var_text = text
        if i == 1:
            var_text = f"Dear Sir, {text}"
        elif i == 2:
            var_text = f"Regarding my grievance: {text}"
        elif i == 3:
            var_text = f"Urgent action required on this case. {text}"
        elif i == 4:
            var_text = f"I am writing to report that: {text}"
        extended_complaints.append((var_text, lang, cat))

with open("datasets/legal_complaints_multilingual.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["complaint_text", "language", "category"])
    writer.writerows(extended_complaints)


# 2. priority_training.csv
priority_data = []
for text, lang, cat in extended_complaints:
    is_sensitive = "true" if any(w in text.lower() for w in ["harassment", "beating", "abusing", "violence", "threaten", "casteist", "boycott", "neglegence", "custody", "minor"]) else "false"
    emergency_keywords_present = "1" if any(w in text.lower() for w in ["kill", "attack", "suicide", "robbed", "danger", "gauze", "negligence", "lockup"]) else "0"
    money_loss_present = "1" if any(w in text.lower() for w in ["salary", "money", "rupees", "deposit", "scam", "panam", "lakh", "bribe", "latcham", "kickback"]) else "0"
    
    # Priority classification rules
    priority_label = "LOW"
    priority_score = 30
    if emergency_keywords_present == "1":
        priority_label = "CRITICAL"
        priority_score = 92
    elif is_sensitive == "true" or cat in ["WOMEN_SAFETY", "DOMESTIC_VIOLENCE", "CRIMINAL_COMPLAINT", "MEDICAL_NEGLIGENCE", "POLICE_MISCONDUCT", "CHILD_WELFARE"]:
        priority_label = "HIGH"
        priority_score = 78
    elif money_loss_present == "1" or cat in ["CYBER_CRIME", "LABOUR_DISPUTE", "INSURANCE_CLAIM", "BANKING_DISPUTE", "CORRUPTION_BRIBERY"]:
        priority_label = "MEDIUM"
        priority_score = 55

    priority_data.append((text, cat, is_sensitive, emergency_keywords_present, money_loss_present, 2, priority_label, priority_score))

with open("datasets/priority_training.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["complaint_text", "category", "is_sensitive", "emergency_keywords_present", "money_loss_present", "duration_months", "priority_label", "priority_score"])
    writer.writerows(priority_data)


# 3. authority_training.csv
authority_data = []
for text, lang, cat in extended_complaints:
    priority = "LOW"
    if any(w in text.lower() for w in ["kill", "attack", "robbed"]):
        priority = "CRITICAL"
    elif cat in ["WOMEN_SAFETY", "DOMESTIC_VIOLENCE", "CRIMINAL_COMPLAINT", "CHILD_WELFARE"]:
        priority = "HIGH"
    
    auth_label = "District Legal Services Authority"
    if cat == "LABOUR_DISPUTE":
        auth_label = "Labour Office"
    elif cat == "CONSUMER_COMPLAINT":
        auth_label = "Consumer Forum"
    elif cat == "CYBER_CRIME":
        auth_label = "Cyber Crime Portal"
    elif cat in ["CRIMINAL_COMPLAINT", "PROPERTY_DISPUTE"]:
        auth_label = "Police Station"
    elif cat == "WOMEN_SAFETY":
        auth_label = "Women Helpline"
    elif cat == "DOMESTIC_VIOLENCE":
        auth_label = "Protection Officer"
    elif cat == "GOVERNMENT_SCHEME":
        auth_label = "Government Grievance Cell"
    elif cat == "MOTOR_ACCIDENT_CLAIM":
        auth_label = "Motor Accident Claims Tribunal"
    elif cat == "INSURANCE_CLAIM":
        auth_label = "Insurance Ombudsman"
    elif cat == "BANKING_DISPUTE":
        auth_label = "Banking Ombudsman"
    elif cat == "RENT_TENANT_DISPUTE":
        auth_label = "Rent Controller Office"
    elif cat == "MEDICAL_NEGLIGENCE":
        auth_label = "State Medical Council"
    elif cat == "EDUCATION_DISPUTE":
        auth_label = "Education Department Office"
    elif cat == "WORKPLACE_HARASSMENT":
        auth_label = "Internal Complaints Committee"
    elif cat == "SENIOR_CITIZEN_ABUSE":
        auth_label = "Social Welfare Officer"
    elif cat == "CHILD_WELFARE":
        auth_label = "Child Welfare Committee"
    elif cat == "DISABILITY_RIGHTS":
        auth_label = "Differently Abled Commissioner Office"
    elif cat in ["CASTE_DISCRIMINATION", "POLICE_MISCONDUCT"]:
        auth_label = "District Collector Office"
    elif cat == "CORRUPTION_BRIBERY":
        auth_label = "Vigilance and Anti-Corruption Bureau"
    elif cat == "CIVIC_INFRASTRUCTURE":
        auth_label = "Municipal Corporation Grievance Cell"
    elif cat == "RTI_APPLICATION":
        auth_label = "Public Information Officer"

    authority_data.append((text, cat, priority, "Coimbatore", auth_label))

with open("datasets/authority_training.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["complaint_text", "category", "priority", "district", "authority_label"])
    writer.writerows(authority_data)

print(f"Generated expanded datasets successfully: 750 training samples across 25 categories.")
