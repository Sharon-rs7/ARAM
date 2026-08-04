import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from app.ml.text_preprocessor import clean_text

def get_training_samples():
    data = []
    
    # 1. Salary Slip
    salary_texts = [
        "Aram Solutions Private Limited Pay Slip Employee ID EMP9821 Gross Salary Net Pay Basic HRA Deduction Account",
        "Salary slip for the month of June 2026 Monthly Earnings Employee code PF deduction Professional tax Net Salary",
        "payslip basic pay allowance total deductions net payable amount bank transfer employee details corporate office",
        "salary statement payment date employer name designation department pan number pf account number total salary",
        "monthly pay slip wage card employee register company name working days salary amount transfer confirmation"
    ]
    for t in salary_texts: data.append((t, "Salary Slip"))
    
    # 2. Bank Statement
    bank_texts = [
        "Bank Statement Account Holder Name Transaction Date Description Withdrawal Deposit Balance Statement of Account",
        "Savings Bank Account statement ledger summary closing balance transaction id credit debit interest charge",
        "Statement of account card payment net banking transfer check deposit withdrawal branch code ifsc account balance",
        "bank transactions summary mini statement ledger posting online debit card purchase current account ledger",
        "hdfc sbi icici bank statement main branch account details customer name balance sheet statement period"
    ]
    for t in bank_texts: data.append((t, "Bank Statement"))
    
    # 3. Rent Agreement
    rent_texts = [
        "Rent Agreement Landlord Tenant Monthly Rent Security Deposit Lease Period Vacate Notice Room Address Witness",
        "rental agreement deed tenancy contract landlord signature tenant name premises description lease terms rent due",
        "lease agreement residential house owner tenant monthly rental amount stamp duty registration witness sign",
        "tenancy agreement room rent advance payment security deposit refund policy lease termination clause",
        "vaadagai oppandham rent house agreement coimbatore owner name tenant name security advance amount lease"
    ]
    for t in rent_texts: data.append((t, "Rent Agreement"))
    
    # 4. Medical Report
    medical_texts = [
        "KG Hospital Patient Name Date Diagnosis Treatment Prescription Doctor Signature Medical Report Clinical Summary",
        "medical certificate patient unfit for duty illness description rest recommended hospital OPD slip doctor clinic",
        "discharge summary patient name admission date surgery diagnosis prescription wrong treatment negligence hospital",
        "medical lab report blood test urine checkup scan results positive negative doctor reference medical case study",
        "clinical diagnosis health card patient record medicine dosage pharmacy receipt doctor treatment history"
    ]
    for t in medical_texts: data.append((t, "Medical Report"))
    
    # 5. Police Complaint / FIR Copy
    police_texts = [
        "First Information Report Police Station FIR Number Date of Incident Theft Crime Complaint Copy Accused Name",
        "police complaint copy vehicle stolen bike theft case station house officer sign police station receipt",
        "FIR registration stamp duty crime branch investigation robbery attack complaint registered under section IPC",
        "complaint petition to police commissioner lockup assault violence police misconduct reporting",
        "police station FIR document TN police department case file complaint sheet acknowledgment copy"
    ]
    for t in police_texts: data.append((t, "Police Complaint / FIR Copy"))
    
    # 6. Aadhaar / ID Proof
    id_texts = [
        "GOVERNMENT OF INDIA Aadhaar Card Name Birth Gender Aadhaar Number Address Father Name Card Holder Identity",
        "Unique Identification Authority of India UIDAI Aadhaar number card enrollment slip address identity proof",
        "voter id card election commission of india name age photo identity proof card cardholder address voter card",
        "PAN Card income tax department government of india cardholder name signature pan number identity card",
        "employee identity card company code name designation office access pass card validity security officer"
    ]
    for t in id_texts: data.append((t, "Aadhaar / ID Proof"))

    # 7. Screenshot Evidence
    screenshot_texts = [
        "Screenshot chat history message threat online fraud blackmail UPI transaction confirmation web page print",
        "whatsapp chat screenshot messages photo blackmail facebook link online harassment evidence image",
        "payment screenshot transaction status success transfer to account balance details receipt image screen",
        "fraudulent link email screenshot sms phishing scam message alert screen capture mobile phone image",
        "chat conversations screenshot photo abuse cyber crime portal evidence attachment photo copy screenshot"
    ]
    for t in screenshot_texts: data.append((t, "Screenshot Evidence"))

    # 8. Consumer Bill / Invoice
    invoice_texts = [
        "Retail Invoice GSTIN Invoice No Seller Customer Name Description Quantity Rate Tax Amount Total Bill Paid",
        "purchase receipt invoice cash memo store name sales bill payment mode cash credit card tax summary invoice",
        "commercial invoice billing statement supplier details item list unit price discount net amount billing details",
        "invoice total amount paid shipping details transaction receipt customer copy cash voucher invoice bill",
        "gst bill tax invoice electro plaza billing computer bill invoice format billing system record receipt"
    ]
    for t in invoice_texts: data.append((t, "Consumer Bill / Invoice"))

    # 9. Property Document
    property_texts = [
        "Property Document Sale Deed Patta Registration Office Survey Number Boundary Land Registration Deed Landlord",
        "land patta copy registration deed boundaries area square feet land registry document registry office stamp",
        "property deed title transfer registry records land survey map registration stamp duty verification document",
        "gift deed property partition land dispute papers registrar office signature stamp duty certificate patta",
        "chitta adangal property document survey boundary details registration status land dispute evidence"
    ]
    for t in property_texts: data.append((t, "Property Document"))

    # 10. General Supporting Document
    general_texts = [
        "ARAM support document copy general papers statement details citizen certificate basic details text copy",
        "general correspondence letter draft application request details notice copy general supporting documents",
        "supplementary documents attachments supporting papers general proof certificate copy standard form print",
        "declaration statement signed copy self attestation format general information sheet application paper",
        "custom attachment copy supporting info citizen identity other files not matching categories"
    ]
    for t in general_texts: data.append((t, "General Supporting Document"))
    
    # Expand dataset programmatically
    expanded_data = []
    for text, label in data:
        # Generate variants
        expanded_data.append((text, label))
        expanded_data.append((f"Copy of: {text}", label))
        expanded_data.append((f"Verified document: {text}", label))
        expanded_data.append((f"{text} certified copy.", label))
        expanded_data.append((f"{text} for ARAM legal case verification.", label))
        
    df = pd.DataFrame(expanded_data, columns=["text", "label"])
    return df

def main():
    print("--- Training Document Text Classifier ---")
    df = get_training_samples()
    
    # Clean text
    df["cleaned_text"] = df["text"].apply(clean_text)
    
    X = df["cleaned_text"].tolist()
    y = df["label"].tolist()
    
    vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1, 2))
    X_vec = vectorizer.fit_transform(X)
    
    clf = LogisticRegression(max_iter=1000, C=1.0)
    clf.fit(X_vec, y)
    
    # Save models
    models_dir = "models"
    os.makedirs(models_dir, exist_ok=True)
    joblib.dump(clf, os.path.join(models_dir, "document_text_classifier.pkl"))
    joblib.dump(vectorizer, os.path.join(models_dir, "document_text_vectorizer.pkl"))
    
    print(f"Document text classifier trained on {len(df)} samples successfully.")

if __name__ == "__main__":
    main()
