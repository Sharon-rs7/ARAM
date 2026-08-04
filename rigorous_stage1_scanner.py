import os
import re
import hashlib

root_dir = r"e:\prgt\My-aram-app"
ignore_dirs = {".git", "node_modules", "dist", "target", "venv", ".pytest_cache", "__pycache__", "mysql_clean", "mysql_data_clean", "mysql_data_standalone", "mysql_local_data", "temp_mysql_data", ".vscode", ".idea"}

all_files = []
for dirpath, dirnames, filenames in os.walk(root_dir):
    dirnames[:] = [d for d in dirnames if d not in ignore_dirs]
    for f in filenames:
        rel_path = os.path.relpath(os.path.join(dirpath, f), root_dir).replace("\\", "/")
        if not rel_path.startswith("_cleanup_archive") and not rel_path.startswith("rigorous_") and not rel_path.startswith("inventory_") and not rel_path.startswith("stage2_") and not rel_path.startswith("check_"):
            all_files.append(rel_path)

print(f"Total files to scan: {len(all_files)}")

# 1. SHA-256 Asset Hashing for byte-identical duplicate detection
asset_extensions = {".png", ".jpg", ".jpeg", ".svg", ".ico", ".wav", ".mp3", ".ttf", ".woff", ".woff2", ".webp", ".pptx"}
asset_hashes = {}
duplicate_assets = []

for fpath in all_files:
    ext = os.path.splitext(fpath)[1].lower()
    if ext in asset_extensions:
        full_p = os.path.join(root_dir, fpath)
        try:
            with open(full_p, "rb") as bf:
                file_hash = hashlib.sha256(bf.read()).hexdigest()
                if file_hash in asset_hashes:
                    duplicate_assets.append((fpath, asset_hashes[file_hash]))
                else:
                    asset_hashes[file_hash] = fpath
        except Exception:
            pass

print(f"Byte-identical duplicate assets found: {len(duplicate_assets)}")
for dup, orig in duplicate_assets:
    print(f"  - Duplicate: {dup} <==> Original: {orig}")

# 2. Text Content Caching & Reference Mapping
file_contents = {}
for fpath in all_files:
    full_p = os.path.join(root_dir, fpath)
    try:
        with open(full_p, "r", encoding="utf-8", errors="ignore") as tf:
            file_contents[fpath] = tf.read()
    except Exception:
        file_contents[fpath] = ""

# Build reference map considering React.lazy, import(), @/ path aliases, and Spring/FastAPI bindings
file_references = {fpath: [] for fpath in all_files}

for fpath, content in file_contents.items():
    if not content:
        continue
    
    for target in all_files:
        if target == fpath:
            continue
        
        target_name = os.path.basename(target)
        target_no_ext = os.path.splitext(target_name)[0]
        
        # Check explicit path or alias (@/components/...) or lazy import
        alias_path = target.replace("src/", "@/")
        
        if (target in content or 
            alias_path in content or 
            f"/{target_name}" in content or 
            f"'{target_no_ext}'" in content or 
            f'"{target_no_ext}"' in content or
            f"import({target_no_ext})" in content or
            f"lazy(() => import(" in content and target_no_ext in content):
            
            # Additional check for Java classes / Python modules
            if target.endswith(".java") or target.endswith(".py"):
                if target_no_ext in content:
                    file_references[target].append(fpath)
            else:
                file_references[target].append(fpath)

# Categorize every individual file
categorized_inventory = []

for fpath in all_files:
    refs = list(set(file_references[fpath]))
    ext = os.path.splitext(fpath)[1].lower()
    
    # Check if duplicate asset
    is_dup_asset = any(fpath == d[0] for d in duplicate_assets)
    
    if is_dup_asset:
        cat = "DUPLICATE"
    elif fpath == "src/styles/global.css" or fpath == "src/services/api.mock.js":
        cat = "DUPLICATE"
    elif len(refs) > 0 or fpath in ["src/App.jsx", "src/main.jsx", "src/index.css", "README.md", "docker-compose.yml", "package.json", "vite.config.js", "capacitor.config.json", "START_FRONTEND_LOCAL.bat", "START_BACKEND_LOCAL.bat", "START_AI_LAN.bat", "ARAM_Hackathon_Pitch_Deck.pptx", "generate_deck.py"]:
        cat = "USED"
    elif fpath.startswith("src/pages/") or fpath.startswith("src/components/") or fpath.startswith("src/services/"):
        # Double-check App.jsx or router imports
        if fpath.replace("src/", "@/") in file_contents.get("src/App.jsx", "") or os.path.splitext(os.path.basename(fpath))[0] in file_contents.get("src/App.jsx", ""):
            cat = "USED"
            refs.append("src/App.jsx")
        else:
            cat = "POSSIBLY UNUSED"
    elif fpath.startswith("aram-backend/src/main/java/"):
        # Entrypoints and Flyway DDL
        if fpath.endswith("Application.java") or fpath.endswith("Properties.java") or fpath.endswith("Config.java"):
            cat = "USED"
        else:
            cat = "POSSIBLY UNUSED"
    elif fpath.startswith("ai-service/"):
        if fpath.startswith("ai-service/app/"):
            cat = "USED"
        else:
            cat = "POSSIBLY UNUSED"
    else:
        cat = "POSSIBLY UNUSED"
        
    categorized_inventory.append((fpath, cat, len(refs), refs))

# Generate _cleanup_archive/STAGE1_FULL_INVENTORY.md
os.makedirs(os.path.join(root_dir, "_cleanup_archive"), exist_ok=True)
inv_file_path = os.path.join(root_dir, "_cleanup_archive", "STAGE1_FULL_INVENTORY.md")

with open(inv_file_path, "w", encoding="utf-8") as out:
    out.write("# Granular Stage 1 Full File-Level Inventory\n\n")
    out.write(f"**Total Scanned Files:** {len(all_files)}\n")
    out.write(f"**Byte-Identical Duplicate Assets Found (SHA-256):** {len(duplicate_assets)}\n\n")
    out.write("| # | File Path | Category | Reference Count | Inbound Callers / Import Sites / Routes |\n")
    out.write("| :--- | :--- | :--- | :--- | :--- |\n")
    
    for idx, (fpath, cat, rcount, rlist) in enumerate(categorized_inventory, 1):
        ref_str = ", ".join(rlist[:3]) if rlist else "None (Direct Entrypoint or Unreferenced)"
        out.write(f"| {idx} | `{fpath}` | **{cat}** | {rcount} | `{ref_str}` |\n")

print(f"STAGE1_FULL_INVENTORY.md generated successfully with {len(categorized_inventory)} rows.")
