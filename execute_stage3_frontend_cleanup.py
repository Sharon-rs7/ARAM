import os
import shutil
import re

root_dir = r"e:\prgt\My-aram-app"
archive_dir = os.path.join(root_dir, "_cleanup_archive", "frontend")
archive_assets_dir = os.path.join(root_dir, "_cleanup_archive", "assets")
os.makedirs(archive_dir, exist_ok=True)
os.makedirs(archive_assets_dir, exist_ok=True)

# 1. Archive approved duplicate files
files_to_archive = [
    ("src/styles/global.css", os.path.join(archive_dir, "global.css")),
    ("src/services/api.mock.js", os.path.join(archive_dir, "api.mock.js")),
    ("android/app/src/main/assets/public/icons/icon.svg", os.path.join(archive_assets_dir, "icon.svg")),
    ("android/app/src/main/res/drawable-land-mdpi/splash.png", os.path.join(archive_assets_dir, "splash.png"))
]

moved_files = []
for src_rel, dest_path in files_to_archive:
    src_path = os.path.join(root_dir, src_rel)
    if os.path.exists(src_path):
        shutil.move(src_path, dest_path)
        moved_files.append((src_rel, dest_path))

print(f"Archived {len(moved_files)} duplicate files.")

# 2. Extract console.log and commented code into _cleanup_archive/frontend_debug_notes.md
debug_notes = []
src_dir = os.path.join(root_dir, "src")

for dirpath, dirnames, filenames in os.walk(src_dir):
    for f in filenames:
        if f.endswith(".js") or f.endswith(".jsx"):
            full_p = os.path.join(dirpath, f)
            rel_p = os.path.relpath(full_p, root_dir).replace("\\", "/")
            with open(full_p, "r", encoding="utf-8", errors="ignore") as file_obj:
                lines = file_obj.readlines()
            
            file_logs = []
            for idx, line in enumerate(lines, 1):
                if "console.log" in line or "console.debug" in line:
                    file_logs.append((idx, line.strip()))
            
            if file_logs:
                debug_notes.append((rel_p, file_logs))

debug_notes_path = os.path.join(root_dir, "_cleanup_archive", "frontend_debug_notes.md")
with open(debug_notes_path, "w", encoding="utf-8") as out:
    out.write("# Frontend Debug Notes & Archived Console Logging\n\n")
    for rel_p, logs in debug_notes:
        out.write(f"### `{rel_p}`\n")
        for line_no, content in logs:
            out.write(f"- Line {line_no}: `{content}`\n")
        out.write("\n")

print(f"Extracted console logs from {len(debug_notes)} files into frontend_debug_notes.md")
