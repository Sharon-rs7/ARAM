import os
import shutil

root_dir = r"e:\prgt\My-aram-app"
old_docs_dir = os.path.join(root_dir, "_cleanup_archive", "old_docs")
scratch_dir = os.path.join(root_dir, "_cleanup_archive", "scratch")
os.makedirs(old_docs_dir, exist_ok=True)
os.makedirs(scratch_dir, exist_ok=True)

# 1. Move temp markdown reports
docs_to_move = [
    "FIXED_SIDEBAR_LAYOUT_REPORT.md",
    "REVIEW_DEMO_RUN_GUIDE.md",
    "SECOND_REVIEW_READY_REPORT.md",
    "TODAYS_CHANGES_TODO.md",
    "UI_POLISH_REPORT.md"
]

moved_docs = 0
for doc in docs_to_move:
    src_p = os.path.join(root_dir, doc)
    if os.path.exists(src_p):
        dest_p = os.path.join(old_docs_dir, doc)
        shutil.move(src_p, dest_p)
        moved_docs += 1

# 2. Move scratch runner scripts
scratch_scripts = [
    "generate_deck.py",
    "inventory_scanner.py",
    "inventory_analyzer.py",
    "stage2_mock_and_dependency_tracer.py",
    "stage2_deep_dive.py",
    "check_circular.py",
    "rigorous_stage1_scanner.py",
    "execute_stage3_frontend_cleanup.py",
    "execute_stage4_backend.py",
    "execute_stage5_ai_cleanup.py"
]

moved_scripts = 0
for script in scratch_scripts:
    src_p = os.path.join(root_dir, script)
    if os.path.exists(src_p):
        dest_p = os.path.join(scratch_dir, script)
        shutil.move(src_p, dest_p)
        moved_scripts += 1

print(f"Stage 6: Consolidated {moved_docs} audit reports into old_docs/ and {moved_scripts} scratch scripts into scratch/")
