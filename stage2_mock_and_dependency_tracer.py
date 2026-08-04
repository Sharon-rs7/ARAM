import os
import re

root_dir = r"e:\prgt/My-aram-app"

# 1. Trace src/data/mock/index.js
mock_file = r"src/data/mock/index.js"
mock_callers = []

for dirpath, dirnames, filenames in os.walk(os.path.join(root_dir, "src")):
    for f in filenames:
        if f.endswith(".js") or f.endswith(".jsx"):
            fpath = os.path.relpath(os.path.join(dirpath, f), root_dir).replace("\\", "/")
            with open(os.path.join(root_dir, fpath), "r", encoding="utf-8", errors="ignore") as file_obj:
                text = file_obj.read()
                if "mock" in text or "USE_MOCKS" in text or "getMock" in text:
                    mock_callers.append((fpath, [line.strip() for line in text.splitlines() if "mock" in line.lower() or "use_mocks" in line.lower()]))

print("=== MOCK TRACE RESULTS ===")
for path, lines in mock_callers:
    print(f"File: {path}")
    for l in lines[:3]:
        print(f"   -> {l}")
print("=========================")
