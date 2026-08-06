import os
import re
from difflib import SequenceMatcher

root_dir = r"e:\prgt\My-aram-app\src\components"
comp_files = []

for dirpath, dirnames, filenames in os.walk(root_dir):
    for f in filenames:
        if f.endswith(".jsx") or f.endswith(".js"):
            comp_files.append(os.path.relpath(os.path.join(dirpath, f), root_dir).replace("\\", "/"))

print(f"Scanning {len(comp_files)} component files for structural JSX similarity...")

contents = {}
for f in comp_files:
    full_p = os.path.join(root_dir, f)
    with open(full_p, "r", encoding="utf-8", errors="ignore") as file_obj:
        # Strip whitespace and comments for AST-like token similarity
        raw = file_obj.read()
        cleaned = re.sub(r"//.*|/\*[\s\S]*?\*/", "", raw)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        contents[f] = cleaned

struct_matches = []
for i in range(len(comp_files)):
    for j in range(i + 1, len(comp_files)):
        f1, f2 = comp_files[i], comp_files[j]
        c1, c2 = contents[f1], contents[f2]
        
        if len(c1) > 50 and len(c2) > 50:
            ratio = SequenceMatcher(None, c1, c2).ratio()
            if ratio > 0.70: # 70%+ structural similarity threshold
                struct_matches.append((f1, f2, round(ratio * 100, 2)))

print(f"Found {len(struct_matches)} structural duplicate/similar component pairs (>70% match):")
for f1, f2, score in struct_matches:
    print(f"  - [{score}% Similar] {f1} <==> {f2}")
