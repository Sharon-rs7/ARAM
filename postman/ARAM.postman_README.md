# ARAM API Testing & Postman Integration Guide

This directory contains the Postman files needed to inspect, test, and document the ARAM REST APIs.

---

## 📂 Files Generated
1. **`ARAM.postman_collection.json`**: The complete collection of all 20 API folders, request forms, parameter inputs, and automation test scripts.
2. **`ARAM.local_environment.json`**: local environment parameters containing URLs, mock credentials, and token targets.

---

## 🚀 Setup Instructions

### Step 1: Import Files into Postman
1. Open Postman.
2. Click the **Import** button in the top-left corner.
3. Drag and drop both `ARAM.postman_collection.json` and `ARAM.local_environment.json` into the file zone.
4. Select import destinations and click confirm.

### Step 2: Set Active Environment
1. In the top-right corner of Postman, select the environment dropdown.
2. Choose **ARAM Local Environment**.

---

## 🔑 Automation & Scripts
- **Automatic Token Preservation:** When you run the `Citizen Login`, `Volunteer Login`, or `Admin Login` requests in the `Authentication` folder, a Postman test script executes to save the resulting authorization tokens to the environment variables (`CITIZEN_TOKEN`, `VOLUNTEER_TOKEN`, `ADMIN_TOKEN`, and `JWT_TOKEN`).
- **Authorization Headers:** All protected APIs use `{{JWT_TOKEN}}` as a Bearer Token.

---

## 📁 Document Uploads
When executing document uploads:
1. Select the `POST {{BASE_URL}}/documents/upload` or `/documents/verify-ai` request.
2. Under the **Body** tab, choose **form-data**.
3. Hover over the `file` parameter row, click the dropdown on the right side of the key field, and select **File**.
4. Click **Select Files** in the value column to choose a mock image or PDF from your computer before clicking Send.

---

## 🗣️ Audio Speech Transcription
When testing speech transcription:
1. Select/Create the `POST {{BASE_URL}}/speech/transcribe` request (proxied) or the direct endpoint `POST {{AI_SERVICE_URL}}/speech/transcribe`.
2. Under the **Body** tab, choose **form-data**.
3. Use key `audio` (or `file`) of type **File**, and upload a `.wav` or `.webm` recording.
4. Set optional text keys `selectedLanguage` (values: `English`, `Tamil`, `Hindi`, `Tanglish`, `Auto`) or `preferredOutputLanguage`.
5. Send request to inspect the generated transcript and translation JSON response.

