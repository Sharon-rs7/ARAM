from pathlib import Path
import shutil


def main() -> None:
    datasets = Path("datasets")
    datasets.mkdir(exist_ok=True)
    seed = datasets / "legal_complaints_normalized.csv"
    if seed.exists():
        print("Normalized dataset already exists.")
        return
    template = datasets / "templates" / "complaints_template.csv"
    if template.exists():
        shutil.copyfile(template, seed)
        print("Created normalized dataset from template.")
    else:
        print("No raw dataset/template found. Run generate_seed_dataset.py.")


if __name__ == "__main__":
    main()
