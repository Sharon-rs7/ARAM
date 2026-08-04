import os
import re

root_dir = r"e:\prgt/My-aram-app"

# Check duplicates and circular imports
files_to_check = [
    "src/styles/global.css",
    "src/services/api.mock.js",
    "generate_deck.py",
    "FIXED_SIDEBAR_LAYOUT_REPORT.md",
    "REVIEW_DEMO_RUN_GUIDE.md",
    "SECOND_REVIEW_READY_REPORT.md",
    "TODAYS_CHANGES_TODO.md",
    "UI_POLISH_REPORT.md"
]

ai_test_scripts = []
ai_dir = os.path.join(root_dir, "ai-service")
for dirpath, dirnames, filenames in os.walk(ai_dir):
    if "venv" in dirpath or "__pycache__" in dirpath or ".pytest_cache" in dirpath:
        continue
    for f in filenames:
        if f.startswith("test_") or f.startswith("verify_") or f.endswith(".txt") or f.endswith(".ps1") or f.endswith(".wav"):
            rel = os.path.relpath(os.path.join(dirpath, f), root_dir).replace("\\", "/")
            ai_test_scripts.append(rel)

print(f"Found {len(ai_test_scripts)} scratch test/verification files in ai-service/")
for s in ai_test_scripts[:10]:
    print(" -", s)
