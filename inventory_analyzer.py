import os
import re

root_dir = r"e:\prgt\My-aram-app"
ignore_dirs = {".git", "node_modules", "dist", "target", "venv", ".pytest_cache", "__pycache__", "mysql_clean", "mysql_data_clean", "mysql_data_standalone", "mysql_local_data", "temp_mysql_data", ".vscode", ".idea"}

all_files = []
for dirpath, dirnames, filenames in os.walk(root_dir):
    dirnames[:] = [d for d in dirnames if d not in ignore_dirs]
    for f in filenames:
        rel_path = os.path.relpath(os.path.join(dirpath, f), root_dir).replace("\\", "/")
        if not rel_path.startswith("inventory_"):
            all_files.append(rel_path)

content_cache = {}
for fpath in all_files:
    full_path = os.path.join(root_dir, fpath)
    try:
        with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
            content_cache[fpath] = f.read()
    except Exception:
        content_cache[fpath] = ""

def count_references(target_file):
    basename = os.path.basename(target_file)
    name_no_ext = os.path.splitext(basename)[0]
    
    count = 0
    ref_sources = []
    
    for fpath, text in content_cache.items():
        if fpath == target_file:
            continue
        
        # Exact path or import matching
        if target_file in text or name_no_ext in text or basename in text:
            # Avoid false positives for common short names
            if len(name_no_ext) > 3:
                count += 1
                ref_sources.append(fpath)
                
    return count, ref_sources

inventory = []

for fpath in all_files:
    count, refs = count_references(fpath)
    
    cat = "USED"
    # Rule based classification
    if fpath.startswith("src/"):
        if count == 0 and not fpath.endswith("main.jsx") and not fpath.endswith("index.css"):
            cat = "POSSIBLY UNUSED"
    elif fpath.startswith("aram-backend/"):
        if count == 0 and not fpath.endswith("Application.java") and not fpath.endswith("pom.xml") and not fpath.endswith("properties"):
            cat = "POSSIBLY UNUSED"
    elif fpath.startswith("ai-service/"):
        if "test_" in fpath or "verify_" in fpath or "step" in fpath or "result" in fpath:
            cat = "POSSIBLY UNUSED"
        elif fpath.endswith(".txt") or fpath.endswith(".ps1"):
            cat = "POSSIBLY UNUSED"
    elif fpath.endswith(".md") and fpath not in ["README.md"]:
        cat = "POSSIBLY UNUSED"
        
    inventory.append((fpath, cat, count, refs[:2]))

print(f"Inventory Scanned: {len(inventory)} total files.")
pos_unused = [item for item in inventory if item[1] == "POSSIBLY UNUSED"]
print(f"Flagged POSSIBLY UNUSED: {len(pos_unused)} files.")
