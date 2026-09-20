import os
from PIL import Image, ImageStat

def check_image_quality(file_path: str) -> dict:
    if not os.path.exists(file_path):
        return {
            "isValid": False,
            "status": "REUPLOAD_REQUIRED",
            "message": "File not found.",
            "blurScore": 0.0,
            "brightness": 0.0,
            "contrast": 0.0
        }

    file_size_kb = os.path.getsize(file_path) / 1024.0
    if file_size_kb > 25600.0:  # 25MB limit
        return {
            "isValid": False,
            "status": "REUPLOAD_REQUIRED",
            "message": "File size exceeds 25MB limit.",
            "blurScore": 0.0,
            "brightness": 0.0,
            "contrast": 0.0
        }

    # Handle PDF documents
    is_pdf = file_path.lower().endswith(".pdf")
    if not is_pdf:
        try:
            with open(file_path, "rb") as f:
                header = f.read(5)
                if header.startswith(b"%PDF"):
                    is_pdf = True
        except Exception:
            pass

    if is_pdf:
        try:
            from pypdf import PdfReader
            reader = PdfReader(file_path)
            num_pages = len(reader.pages)
            if num_pages == 0:
                return {
                    "isValid": False,
                    "status": "REUPLOAD_REQUIRED",
                    "message": "PDF document contains no readable pages.",
                    "blurScore": 0.0,
                    "brightness": 0.0,
                    "contrast": 0.0
                }
            return {
                "isValid": True,
                "status": "UPLOADED",
                "message": f"PDF document with {num_pages} page(s) is valid.",
                "blurScore": 100.0,
                "brightness": 128.0,
                "contrast": 60.0
            }
        except Exception as pdf_err:
            print(f"PDF check error: {pdf_err}")
            return {
                "isValid": False,
                "status": "REUPLOAD_REQUIRED",
                "message": "Corrupted or password-protected PDF document.",
                "blurScore": 0.0,
                "brightness": 0.0,
                "contrast": 0.0
            }

    try:
        with Image.open(file_path) as img:
            width, height = img.size
            
            # Check dimensions
            if width < 300 or height < 300:
                return {
                    "isValid": False,
                    "status": "REUPLOAD_REQUIRED",
                    "message": "Image resolution is too low. Please upload a clearer photo.",
                    "blurScore": 0.0,
                    "brightness": 0.0,
                    "contrast": 0.0
                }

            # Convert to grayscale to check brightness & contrast
            gray_img = img.convert("L")
            stat = ImageStat.Stat(gray_img)
            brightness = stat.mean[0]
            contrast = stat.stddev[0]
            
            # Brightness checks (0-255)
            if brightness < 30:
                return {
                    "isValid": False,
                    "status": "REUPLOAD_REQUIRED",
                    "message": "Photo is too dark. Please take a photo in good lighting.",
                    "blurScore": 100.0,
                    "brightness": brightness,
                    "contrast": contrast
                }
            if brightness > 235:
                return {
                    "isValid": False,
                    "status": "REUPLOAD_REQUIRED",
                    "message": "Photo is overexposed. Please avoid camera flash glare.",
                    "blurScore": 100.0,
                    "brightness": brightness,
                    "contrast": contrast
                }

            # Contrast checks
            if contrast < 12:
                return {
                    "isValid": False,
                    "status": "REUPLOAD_REQUIRED",
                    "message": "Image contrast is too low. The text is not readable.",
                    "blurScore": 100.0,
                    "brightness": brightness,
                    "contrast": contrast
                }

            # Blur check: Try OpenCV Laplacian, fallback to mock blur score
            blur_score = 100.0
            try:
                import cv2
                # Calculate Laplacian variance
                image = cv2.imread(file_path, cv2.IMREAD_GRAYSCALE)
                if image is not None:
                    blur_score = cv2.Laplacian(image, cv2.CV_64F).var()
            except Exception:
                # Fallback blur check (heuristic based on contrast/stddev)
                blur_score = float(contrast * 2.5)

            # If blur score is extremely low (meaning blurry)
            if blur_score < 15.0:
                return {
                    "isValid": False,
                    "status": "REUPLOAD_REQUIRED",
                    "message": "Photo is blurry. Please hold the camera still and retake.",
                    "blurScore": blur_score,
                    "brightness": brightness,
                    "contrast": contrast
                }

            return {
                "isValid": True,
                "status": "UPLOADED",
                "message": "Image quality is acceptable.",
                "blurScore": round(blur_score, 2),
                "brightness": round(brightness, 2),
                "contrast": round(contrast, 2)
            }
            
    except Exception as e:
        print(f"Error checking image quality: {e}")
        return {
            "isValid": False,
            "status": "REUPLOAD_REQUIRED",
            "message": f"Unable to parse image file: {str(e)}",
            "blurScore": 0.0,
            "brightness": 0.0,
            "contrast": 0.0
        }
