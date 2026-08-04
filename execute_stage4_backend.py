import os
import shutil

root_dir = r"e:\prgt\My-aram-app"
backend_dir = os.path.join(root_dir, "aram-backend")

# Extract System.out.println to _cleanup_archive/backend_debug_notes.md
sysout_logs = []
for dirpath, dirnames, filenames in os.walk(os.path.join(backend_dir, "src")):
    for f in filenames:
        if f.endswith(".java"):
            full_p = os.path.join(dirpath, f)
            rel_p = os.path.relpath(full_p, root_dir).replace("\\", "/")
            with open(full_p, "r", encoding="utf-8", errors="ignore") as file_obj:
                lines = file_obj.readlines()
            
            file_logs = []
            for idx, line in enumerate(lines, 1):
                if "System.out.print" in line:
                    file_logs.append((idx, line.strip()))
            
            if file_logs:
                sysout_logs.append((rel_p, file_logs))

debug_notes_path = os.path.join(root_dir, "_cleanup_archive", "backend_debug_notes.md")
with open(debug_notes_path, "w", encoding="utf-8") as out:
    out.write("# Backend Debug Notes & Archived System.out Logging\n\n")
    for rel_p, logs in sysout_logs:
        out.write(f"### `{rel_p}`\n")
        for line_no, content in logs:
            out.write(f"- Line {line_no}: `{content}`\n")
        out.write("\n")

print(f"Stage 4: Extracted System.out.println calls from {len(sysout_logs)} Java files into backend_debug_notes.md")
