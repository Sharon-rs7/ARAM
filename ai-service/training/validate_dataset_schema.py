from pathlib import Path


REQUIRED_COLUMNS = {
    "complaint_text",
    "language",
    "category",
    "priority",
    "authority",
    "required_documents",
    "next_steps",
    "source_dataset",
    "label_source",
    "manual_label_required",
}


def main() -> None:
    path = Path("datasets/legal_complaints_normalized.csv")
    if not path.exists():
        print("No normalized dataset found yet. Run generate_seed_dataset.py or normalize_complaint_dataset.py.")
        return
    header = set(path.read_text(encoding="utf-8").splitlines()[0].split(","))
    missing = REQUIRED_COLUMNS - header
    if missing:
        raise SystemExit(f"Missing required columns: {sorted(missing)}")
    print("Dataset schema is valid.")


if __name__ == "__main__":
    main()
