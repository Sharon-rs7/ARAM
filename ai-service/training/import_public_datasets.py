from pathlib import Path


def main() -> None:
    Path("raw_datasets").mkdir(exist_ok=True)
    print("Public dataset import skipped. Place optional CSV files under raw_datasets/.")


if __name__ == "__main__":
    main()
