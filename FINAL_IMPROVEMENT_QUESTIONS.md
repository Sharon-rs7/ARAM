# Final Improvement Questions

This document analyzes the technical challenges and highlights of the ARAM platform.

## 1. Key Questions & Answers

### Q1: What is the biggest UX problem now?
- **A:** Helping low-literacy users understand the difference between identity visibility modes. Adding illustrative visual icons/tooltips is recommended.

### Q2: What is the biggest technical risk?
- **A:** Restricting access keys for symmetric database encryption. A secure HSM (Hardware Security Module) integration is planned.

### Q3: What is the strongest feature?
- **A:** The unified **Settings Center**, which handles responsive layout rendering dynamically (side-tabs on desktop, collapsibles on mobile with >44px touch targets).

### Q4: What is the weakest role flow?
- **A:** Admin auto-recommendations, which still require manual confirmation and assignment.

---

## 2. Immediate Next Steps
1. **SMS Gateway Integration:** Connect simulated notifications to a real Twilio or WhatsApp Business API.
2. **Dynamic Heatmaps:** Feed the volunteer heatmap directly from the database log counts instead of seed logs.
3. **Tooltip explanations:** Detail the visibility options clearly on the submission form.
