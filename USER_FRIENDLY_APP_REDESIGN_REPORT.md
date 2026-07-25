# ARAM User Friendly App Redesign Report

This report documents the design patterns inspired by successful retail applications (such as Amazon and Flipkart) that were implemented to simplify user interaction.

## 1. Amazon/Flipkart Inspired Patterns

1. **Service Cards over Complex Directories:**
   Instead of forcing users to browse legal categories, the dashboard provides 4 large action cards:
   - **Speak Complaint:** For recording narration via microphone.
   - **Type Complaint:** To submit text in simple language.
   - **Track My Complaint:** Order-tracking-style timeline.
   - **Talk to Legal Guide:** Secure consultation room.

2. **Step-by-Step Wizard Progress:**
   The complaint submission wizard splits the input requirements into 6 steps. This prevents input fatigue.

3. **Status Timelines:**
   A status timeline (Submitted &rarr; AI Checked &rarr; Admin Reviewing &rarr; Legal Guide Assigned &rarr; In Progress &rarr; Resolved) gives users instant clarity on the case stage.

---

## 2. Touch comfort & viewport rules
- All interactive buttons and inputs feature a minimum touch height of `48dp` (`44px` minimum) to prevent mis-taps.
- Responsive styles dynamically shift layouts: side-tabs are hidden on mobile, replaced by bottom navigations and collapsible accordions.
