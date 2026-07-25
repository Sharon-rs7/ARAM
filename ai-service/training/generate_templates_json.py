import json
import os

os.makedirs("datasets", exist_ok=True)

categories_subcategories = {
    "LABOUR_DISPUTE": [
        ("Salary Not Paid", "Unpaid salary or wages delayed by employer", "MEDIUM", False),
        ("Unfair Dismissal", "Terminated from job without notice or valid reason", "HIGH", False),
        ("Overtime Exploitation", "Forced to work overtime without extra pay", "LOW", False),
        ("Contract Breach", "Employer violated terms of employment agreement", "MEDIUM", False)
    ],
    "CONSUMER_COMPLAINT": [
        ("Defective Product", "Received damaged or malfunctioning item", "LOW", False),
        ("Warranty Denial", "Seller or brand refused to honor product warranty", "LOW", False),
        ("Overcharging MRP", "Shopkeeper charged extra price above maximum retail price", "LOW", False),
        ("Fake Online Order", "Ordered item online but received empty box or fake item", "MEDIUM", False)
    ],
    "CYBER_CRIME": [
        ("UPI Fraud Scam", "Lost money to fraudulent QR code or UPI link", "MEDIUM", False),
        ("Account Hacking", "Social media or email account accessed by hackers", "MEDIUM", False),
        ("Phishing Link", "Received suspicious link requesting banking password/OTP", "HIGH", False),
        ("Identity Theft", "Personal documents used online without authorization", "HIGH", False)
    ],
    "PROPERTY_DISPUTE": [
        ("Boundary Encroachment", "Neighbor built wall crossing land boundaries", "MEDIUM", False),
        ("Deposit Refund Denial", "Landlord refused to refund lease security deposit", "MEDIUM", False),
        ("Forged Title Deed", "Fake land registration deed used to claim ownership", "HIGH", False),
        ("Land Illegal Occupation", "Goon or relative illegally occupying land parcel", "HIGH", False)
    ],
    "WOMEN_SAFETY": [
        ("Stalking", "Followed physically or online persistently by a stalker", "HIGH", True),
        ("Public Harassment", "Verbal abuse or threats faced at bus stops or roads", "HIGH", True),
        ("Inappropriate Messaging", "Received obscene messages on chat platforms", "HIGH", True),
        ("Voyeurism", "Secret video recording or photography without consent", "CRITICAL", True)
    ],
    "DOMESTIC_VIOLENCE": [
        ("Physical Abuse", "Assaulted physically by husband or in-laws", "CRITICAL", True),
        ("Dowry Threat", "Threatened or abused demanding gold/cash dowry", "HIGH", True),
        ("Forced Confinement", "Locked inside house or restricted from calling family", "CRITICAL", True),
        ("Emotional Blackmail", "Constant harassment causing mental torture at home", "HIGH", True)
    ],
    "CRIMINAL_COMPLAINT": [
        ("Theft/Housebreak", "House broken into and valuables stolen", "HIGH", False),
        ("Assault/Battery", "Physically attacked by a gang or neighbor with weapons", "CRITICAL", False),
        ("Extortion/Blackmail", "Demanded money under threat of exposing personal info", "HIGH", False),
        ("Vandalism/Property Damage", "Private vehicle or house gate damaged intentionally", "MEDIUM", False)
    ],
    "FAMILY_DISPUTE": [
        ("Child Custody", "Dispute over custody rights of minor child during separation", "MEDIUM", False),
        ("Divorce Proceedings", "Filing for legal divorce due to mutual incompatibility", "MEDIUM", False),
        ("Ancestral Property Division", "Sisters or brothers disputing ancestral share division", "MEDIUM", False),
        ("Forced Marriage", "Family members forcing marriage against personal will", "HIGH", False)
    ],
    "GOVERNMENT_SCHEME": [
        ("Widow Pension Delay", "Pending approval for widow pension scheme for months", "LOW", False),
        ("Ration Card Denial", "Ration shop refusing to issue card or supply commodities", "LOW", False),
        ("Housing Benefits Reject", "Eligible housing scheme request turned down by officials", "LOW", False),
        ("Farmer Subsidy Issue", "Fertilizer or crop damage subsidy money not credited", "LOW", False)
    ],
    "GENERAL_LEGAL_AID": [
        ("Contract Consultation", "Need lawyer to review partnership or land lease agreement", "LOW", False),
        ("Court Summon Guidance", "Received summon as witness or defendant, next steps info", "MEDIUM", False),
        ("Affidavit Filing", "Drafting name change or address proof affidavit", "LOW", False),
        ("Free Lawyer Application", "Requesting DLSA panel advocate for representation", "LOW", False)
    ],
    "MOTOR_ACCIDENT_CLAIM": [
        ("Third Party Property Damage", "Vehicle damaged due to reckless driving of another car", "LOW", False),
        ("Bodily Injury Compensation", "Seeking accident claim from insurer for fractures", "HIGH", False),
        ("Hit and Run Claim", "Injured by unknown speeding vehicle fleeing accident spot", "HIGH", False),
        ("Tribunal Petition Filing", "Submitting MACT claim petition after collision", "MEDIUM", False)
    ],
    "INSURANCE_CLAIM": [
        ("Life Cover Rejection", "Nominee claim denied by insurer claiming hidden illness", "MEDIUM", False),
        ("Health Surgery Denied", "TPA rejected cashless hospitalization pre-auth request", "MEDIUM", False),
        ("Crop Failure Compensation", "Natural calamity damage payout pending from crop insurer", "LOW", False),
        ("Car Collision Refusal", "Claim rejected alleging license validity discrepancy", "LOW", False)
    ],
    "BANKING_DISPUTE": [
        ("Unauthorized Cards Fees", "Billed annual charges despite card being lifetime free", "LOW", False),
        ("Account Freezing", "Bank frozen savings account without notice", "MEDIUM", False),
        ("Loan EMI Double Debit", "EMI deducted twice in a month due to technical glitch", "LOW", False),
        ("ATM Cash Dispense Failure", "Money debited from account but cash not dispensed", "LOW", False)
    ],
    "RENT_TENANT_DISPUTE": [
        ("Illegal Eviction", "Landlord cut electricity to force tenant out before lease end", "HIGH", False),
        ("Maintenance Failure", "Owner refusing to repair leaking roof and drainage pipes", "LOW", False),
        ("Commercial Lease Breach", "Premises lease terms modified arbitrarily by building owner", "MEDIUM", False),
        ("Unauthorized Subletting", "Tenant sublet the apartment to third parties without lease permit", "MEDIUM", False)
    ],
    "MEDICAL_NEGLIGENCE": [
        ("Surgical Gauze Left In", "Foreign object left inside abdomen during appendicitis surgery", "CRITICAL", False),
        ("Wrong Drug Prescription", "Pharmacist or clinic dispensed wrong dosage leading to poisoning", "HIGH", False),
        ("Delayed Emergency Treatment", "Accident patient denied ICU admission demanding deposit first", "CRITICAL", False),
        ("Misdiagnosis Damage", "Treated for wrong illness leading to worsening of condition", "HIGH", False)
    ],
    "EDUCATION_DISPUTE": [
        ("TC/Certificate Withholding", "College refusing to issue transfer certificate demanding extra fees", "MEDIUM", False),
        ("Illegal Capitation Fees", "School demanding donation money for admission under management seat", "MEDIUM", False),
        ("RTE Quota Denial", "Refused free education quota seat despite matching income criteria", "LOW", False),
        ("Hostel Harassment", "Warden or seniors mentally harassing student in university hostel", "HIGH", False)
    ],
    "WORKPLACE_HARASSMENT": [
        ("Quid Pro Quo Coercion", "Supervisor demanding sexual favors for salary increment", "HIGH", True),
        ("Hostile Boss Outrage", "Shouted at publicly using abusive slurs continuously", "MEDIUM", False),
        ("Salary Deduction Threats", "Forced to work late hours under threat of firing", "MEDIUM", False),
        ("Gender Bias Promotion", "Passed over for promotion despite being top performer based on gender", "LOW", False)
    ],
    "SENIOR_CITIZEN_ABUSE": [
        ("Property Forcible Transfer", "Son forced elder father to sign gift deed for house", "HIGH", False),
        ("Abandonment/Starvation", "Elderly mother left at bus stand without food or money", "CRITICAL", False),
        ("Physical Assault", "Daughter-in-law physically beating aged mother-in-law", "CRITICAL", True),
        ("Maintenance Claim Refusal", "Children earning high salaries refusing basic monthly maintenance", "MEDIUM", False)
    ],
    "CHILD_WELFARE": [
        ("Child Labor Hotel", "Minor child employed for washing dishes in local restaurant", "HIGH", False),
        ("Forced Child Marriage", "Relatives organizing wedding ceremony for a minor schoolgirl", "CRITICAL", True),
        ("School Dropouts Neglect", "Orphan kid kept out of school and sent for begging", "HIGH", False),
        ("Juvenile Delinquency Help", "Assistance needed for counseling minor caught in minor theft", "LOW", False)
    ],
    "DISABILITY_RIGHTS": [
        ("Wheelchair Ramp Absence", "Public bank branch refuses to construct accessible ramp entry", "LOW", False),
        ("Job Reservation Denial", "Differently abled candidate rejected in interview citing disability", "MEDIUM", False),
        ("Welfare Card Processing delay", "UDID card application stuck at welfare office for months", "LOW", False),
        ("Assistive Devices Quota", "Eligible applicant denied free wheelchair scheme by panchayat", "LOW", False)
    ],
    "CASTE_DISCRIMINATION": [
        ("Temple Festival Boycott", "SC community excluded from participation in village chariot festival", "HIGH", False),
        ("Public Well Access Denied", "Not allowed to draw water from shared public borewell", "HIGH", False),
        ("Separate Tumbler System", "Separate glasses used for serving tea based on community identity", "HIGH", False),
        ("Casteist Verbal Abuse", "Abused using derogatory caste names at local workplace", "HIGH", False)
    ],
    "POLICE_MISCONDUCT": [
        ("Refusal to Register FIR", "Police station officer refused to take complaint for bike theft", "MEDIUM", False),
        ("Custodial Lockup Torture", "Suspect beaten brutally inside police cell during interrogation", "CRITICAL", False),
        ("False Case Frame Up", "Fabricated evidence used to lock up innocent citizen", "CRITICAL", False),
        ("Assault at Traffic Checkpoint", "Traffic constable physically assaulted driver over argument", "HIGH", False)
    ],
    "CORRUPTION_BRIBERY": [
        ("Bribe for Death Certificate", "Village officer demanding Rs 2000 to sign death certificate copy", "MEDIUM", False),
        ("Municipal Inspector Kickback", "Building plan approval delayed demanding percentage kickback", "MEDIUM", False),
        ("Revenue Patta Bribery", "Tahsildar office demanding bribe to verify patta land transfer", "MEDIUM", False),
        ("Licensing Officer Bribe", "Food safety officer demanding bribe for license issuance", "MEDIUM", False)
    ],
    "CIVIC_INFRASTRUCTURE": [
        ("Sewage Water Mixture", "Sewage line leakage mixing into public drinking water pipeline", "HIGH", False),
        ("Dangerous Potholes Main road", "Massive open craters on highway causing regular accidents", "MEDIUM", False),
        ("Non-functioning Street Lights", "Complete dark stretch on main road causing rise in snatching cases", "LOW", False),
        ("Piles of Garbage Dump", "Garbage not cleared for weeks in residential colony corner", "LOW", False)
    ],
    "RTI_APPLICATION": [
        ("PIO Refused Application", "Public Info Officer refused to accept RTI letter submission", "LOW", False),
        ("Intentionally Fake Information", "Provided incorrect details regarding public funds usage", "MEDIUM", False),
        ("Delay Beyond 30 days", "No reply received for RTI inquiry after the legal 30 days deadline", "LOW", False),
        ("RTI First Appeal Rejection", "First appellate authority dismissed appeal without hearing reason", "LOW", False)
    ]
}

templates = []
id_counter = 1

for cat, subcats in categories_subcategories.items():
    for sub, desc, prio, sens in subcats:
        prob_id = f"LP-{id_counter:03d}"
        
        # Formulate keywords
        kw_en = [cat.lower().replace("_", " "), sub.lower(), "legal help", "assistance"]
        kw_ta = ["உதவி", "சட்டம்", sub.lower()]
        
        # Formulate document rules based on subcategory name clues
        docs = ["Aadhaar Card"]
        if "salary" in sub.lower() or "overtime" in sub.lower() or "contract" in sub.lower():
            docs.extend(["Salary Slip", "Employee ID", "Employment Agreement"])
        elif "product" in sub.lower() or "warranty" in sub.lower() or "mrp" in sub.lower() or "order" in sub.lower():
            docs.extend(["Invoice Receipts", "Product Images", "Transaction Screenshot"])
        elif "fraud" in sub.lower() or "hacking" in sub.lower() or "phishing" in sub.lower() or "banking" in sub.lower():
            docs.extend(["Bank Statement", "Transaction Screenshot"])
        elif "encroachment" in sub.lower() or "deed" in sub.lower() or "land" in sub.lower() or "property" in sub.lower() or "lease" in sub.lower():
            docs.extend(["Property Land Patta", "Sale Deed / Lease copy", "Tax Receipts"])
        elif "eviction" in sub.lower() or "tenant" in sub.lower():
            docs.extend(["Rent Agreement", "Rent Receipts"])
        elif "medical" in sub.lower() or "negligence" in sub.lower() or "accident" in sub.lower() or "injury" in sub.lower() or "misdiagnosis" in sub.lower():
            docs.extend(["Medical Reports", "Treatment Bills", "Prescriptions"])
        elif "abuse" in sub.lower() or "assault" in sub.lower() or "theft" in sub.lower() or "police" in sub.lower() or "fir" in sub.lower():
            docs.extend(["Police Complaint Copy", "FIR Copy", "Medical Wound Certificate"])
        elif "caste" in sub.lower():
            docs.extend(["Community Certificate"])
        elif "disability" in sub.lower():
            docs.extend(["Disability Certificate"])
        elif "scheme" in sub.lower() or "benefits" in sub.lower() or "pension" in sub.lower() or "ration" in sub.lower():
            docs.extend(["Ration Card", "Income Certificate"])

        # Determine authority
        auth = "District Legal Services Authority"
        if cat == "LABOUR_DISPUTE":
            auth = "Labour Office"
        elif cat == "CONSUMER_COMPLAINT":
            auth = "Consumer Forum"
        elif cat == "CYBER_CRIME":
            auth = "Cyber Crime Portal"
        elif cat in ["CRIMINAL_COMPLAINT", "PROPERTY_DISPUTE"]:
            auth = "Police Station"
        elif cat == "WOMEN_SAFETY":
            auth = "Women Helpline"
        elif cat == "DOMESTIC_VIOLENCE":
            auth = "Protection Officer"
        elif cat == "GOVERNMENT_SCHEME":
            auth = "Government Grievance Cell"
        elif cat == "MOTOR_ACCIDENT_CLAIM":
            auth = "Motor Accident Claims Tribunal"
        elif cat == "INSURANCE_CLAIM":
            auth = "Insurance Ombudsman"
        elif cat == "BANKING_DISPUTE":
            auth = "Banking Ombudsman"
        elif cat == "RENT_TENANT_DISPUTE":
            auth = "Rent Controller Office"
        elif cat == "MEDICAL_NEGLIGENCE":
            auth = "State Medical Council"
        elif cat == "EDUCATION_DISPUTE":
            auth = "Education Department Office"
        elif cat == "WORKPLACE_HARASSMENT":
            auth = "Internal Complaints Committee"
        elif cat == "SENIOR_CITIZEN_ABUSE":
            auth = "Social Welfare Officer"
        elif cat == "CHILD_WELFARE":
            auth = "Child Welfare Committee"
        elif cat == "DISABILITY_RIGHTS":
            auth = "Differently Abled Commissioner Office"
        elif cat in ["CASTE_DISCRIMINATION", "POLICE_MISCONDUCT"]:
            auth = "District Collector Office"
        elif cat == "CORRUPTION_BRIBERY":
            auth = "Vigilance and Anti-Corruption Bureau"
        elif cat == "CIVIC_INFRASTRUCTURE":
            auth = "Municipal Corporation Grievance Cell"
        elif cat == "RTI_APPLICATION":
            auth = "Public Information Officer"

        # Determine gender rule
        gender_rule = "ANY"
        if sens or cat in ["WOMEN_SAFETY", "DOMESTIC_VIOLENCE", "WORKPLACE_HARASSMENT"]:
            gender_rule = "FEMALE_PREFERRED"

        record = {
            "problemId": prob_id,
            "category": cat,
            "subcategory": sub,
            "languageKeywords": {
                "English": kw_en,
                "Tamil": kw_ta,
                "Hindi": [sub.lower(), "sahayata"],
                "Tanglish": [sub.lower().replace(" ", ""), "help"]
            },
            "sampleComplaints": {
                "English": f"Regarding my grievance: {desc} in my area.",
                "Tamil": f"எனக்கு இதில் உதவி தேவை: {desc}.",
                "Hindi": f"मुझे इस समस्या में सहायता चाहिए: {desc}.",
                "Tanglish": f"Enaku help venum: {desc} process pathi."
            },
            "priorityCode": prio,
            "priorityName": "Urgent Intervention" if prio == "CRITICAL" or prio == "HIGH" else ("Priority Review" if prio == "MEDIUM" else "Standard Guidance"),
            "highRiskSignals": ["suicide", "murder", "kill", "death"] if prio in ["CRITICAL", "HIGH"] else [],
            "requiredDocuments": list(set(docs)),
            "recommendedAuthority": auth,
            "nextSteps": [
                f"Gather all supporting {', '.join(docs[:2])} proofs.",
                f"Draft formal written statement of {sub}.",
                f"Submit the petition to the recommended {auth}."
            ],
            "volunteerExpertiseTags": [cat.lower(), sub.lower().replace(" ", "_")],
            "womenSensitive": sens,
            "preferredVolunteerGenderRule": gender_rule,
            "disclaimer": "ARAM provides preliminary complaint guidance only. It does not replace police, court, lawyer, or official authority."
        }
        templates.append(record)
        id_counter += 1

with open("datasets/legal_problem_templates.json", "w", encoding="utf-8") as f:
    json.dump(templates, f, indent=2, ensure_ascii=False)

print(f"Generated {len(templates)} templates inside datasets/legal_problem_templates.json.")
