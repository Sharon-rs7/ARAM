import os
import urllib.request
import zipfile

model_dir = os.path.expanduser('~/.EasyOCR/model')
os.makedirs(model_dir, exist_ok=True)

models = {
    "craft_mlt_25k.zip": "https://github.com/JaidedAI/EasyOCR/releases/download/pre-v1.1.6/craft_mlt_25k.zip",
    "english_g2.zip": "https://github.com/JaidedAI/EasyOCR/releases/download/v1.3/english_g2.zip"
}

for fname, url in models.items():
    zip_path = os.path.join(model_dir, fname)
    pth_name = fname.replace('.zip', '.pth')
    pth_path = os.path.join(model_dir, pth_name)
    
    if os.path.exists(pth_path):
        print(f"[EASYOCR MODEL EXISTS]: {pth_name}")
        continue
        
    print(f"Downloading {fname} from {url}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response, open(zip_path, 'wb') as out_file:
        out_file.write(response.read())
        
    print(f"Extracting {fname} to {model_dir}...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(model_dir)
    print(f"Extracted {pth_name} successfully.")

print("All EasyOCR PyTorch model weights downloaded successfully.")
