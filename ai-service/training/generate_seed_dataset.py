from pathlib import Path


HEADER = "complaint_text,language,category,priority,authority,required_documents,next_steps,source_dataset,label_source,manual_label_required\n"
ROWS = [
    "My employer has not paid salary for three months,ENGLISH,LABOUR_DISPUTE,HIGH,Labour Department,Salary slips;Employment proof,Collect proof;File labour complaint,seed,weak,false\n",
    "Online seller took money but did not deliver product,ENGLISH,CONSUMER_COMPLAINT,MEDIUM,Consumer Forum,Invoice;Payment proof,Send notice;File consumer complaint,seed,weak,false\n",
    "Someone threatened me and my family,ENGLISH,CRIMINAL_THREAT,CRITICAL,Police,Identity proof;Threat evidence,Seek immediate safety;Contact police,seed,weak,true\n",
]


def main() -> None:
    datasets = Path("datasets")
    templates = datasets / "templates"
    templates.mkdir(parents=True, exist_ok=True)
    (templates / "complaints_template.csv").write_text(HEADER, encoding="utf-8")
    (datasets / "legal_complaints_normalized.csv").write_text(HEADER + "".join(ROWS), encoding="utf-8")
    print("Seed legal complaint datasets generated.")


if __name__ == "__main__":
    main()
