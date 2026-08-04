import os
import re

root_dir = r"e:\prgt\My-aram-app"
ignore_dirs = {".git", "node_modules", "dist", "target", "venv", ".pytest_cache", "__pycache__", "mysql_clean", "mysql_data_clean", "mysql_data_standalone", "mysql_local_data", "temp_mysql_data", ".vscode", ".idea"}

all_files = []
for dirpath, dirnames, filenames in os.walk(root_dir):
    dirnames[:] = [d for d in dirnames if d not in ignore_dirs]
    for f in filenames:
        rel_path = os.path.relpath(os.path.join(dirpath, f), root_dir)
        all_files.append(rel_path.replace("\\", "/"))

print(f"Total project files found: {len(all_files)}")
