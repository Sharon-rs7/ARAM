import os
import subprocess
from fastapi import APIRouter, BackgroundTasks, HTTPException, Depends
from app.auth import verify_internal_token

router = APIRouter(dependencies=[Depends(verify_internal_token)])

def run_train_script():
    try:
        # Run training scripts as a subprocess
        subprocess.run(["python", "training/train_all.py"], check=True)
        return True
    except Exception as e:
        print(f"Error running training pipeline: {e}")
        return False

@router.post("/train/all")
def train_all(background_tasks: BackgroundTasks):
    # Run training in background so we don't time out HTTP requests
    background_tasks.add_task(run_train_script)
    return {
        "status": "Training pipeline initiated in background",
        "logLocation": "models/saved/training.log"
    }
