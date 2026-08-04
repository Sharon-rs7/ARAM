import os
import shutil

root_dir = r"e:\prgt\My-aram-app"
ai_dir = os.path.join(root_dir, "ai-service")
archive_ai_dir = os.path.join(root_dir, "_cleanup_archive", "ai_tests")
os.makedirs(archive_ai_dir, exist_ok=True)

moved_count = 0
for item in os.listdir(ai_dir):
    item_path = os.path.join(ai_dir, item)
    if os.path.isfile(item_path):
        if (item.startswith("test_") or item.startswith("verify_") or item.endswith(".txt") or item.endswith(".ps1") or item.endswith(".wav") or item.startswith("step") or item.startswith("fix_") or item in ["compare_onnx_vs_pkl.py", "init_and_run_mysql.py", "run_redis_server.py", "setup_local_mysql.py"]):
            if item not in ["requirements.txt", "Dockerfile"]:
                dest_p = os.path.join(archive_ai_dir, item)
                shutil.move(item_path, dest_p)
                moved_count += 1

print(f"Stage 5: Moved {moved_count} scratch test/verification files from ai-service/ into _cleanup_archive/ai_tests/")
