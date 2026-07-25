# Mobile Low Literacy UX Report

This report outlines the design principles implemented to support low-literacy, non-technical, and voice-first users.

## 1. Assistive Tools

1. **Voice Input Narration:**
   Users can record their legal issues using the voice mic. The FastAPI backend transcribes speech to text, mapping it directly into the complaint form.

2. **Web Speech Synthesis (Text-to-Speech):**
   Help accordions feature a "Read Aloud" button that uses the browser's speech synthesis engine to read explanations to the user in English, Tamil, or Hindi.

3. **Multilingual Interface:**
   A simple language switcher allows toggle transitions between English, Tamil, and Hindi.

---

## 2. Low-Literacy Rules

- **Hide Legal Jargon:** Optional categorizations are used. AI triages the case category automatically.
- **Large Input Fields:** Touch targets use a minimum height of `48px`.
- **Placeholder Guides:** Text fields feature clear examples (e.g. *"Salary unpaid by manager"*).
- **Emergency Actions:** Women safety alerts and helpline numbers are clearly highlighted.
