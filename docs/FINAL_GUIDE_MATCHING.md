# ARAM AI — LEGAL GUIDE (VOLUNTEER) MATCHING ENGINE

## 1. Multi-Factor Scoring Formulation

Match Score is calculated as an explainable composite index:

$$\text{Score} = 0.25 W_{\text{district}} + 0.20 W_{\text{lang}} + 0.20 W_{\text{spec}} + 0.15 W_{\text{exp}} + 0.10 W_{\text{avail}} + 0.05 W_{\text{load}} + 0.05 W_{\text{hist}}$$

### Factor Definitions:
- **District Match ($W_{\text{district}}$)**: $1.0$ if guide is located in the complaint's district; $0.0$ if outside.
- **Language Match ($W_{\text{lang}}$)**: $1.0$ if guide is fluent in the citizen's preferred dialect (e.g. Tamil/Hindi); $0.2$ if English-only.
- **Specialization Match ($W_{\text{spec}}$)**: $1.0$ if guide's verified expertise covers the complaint taxonomy (e.g. Labour, Domestic Violence, Consumer).
- **Experience Level ($W_{\text{exp}}$)**: JUNIOR (Level 1, 0-500 XP), INTERMEDIATE (Level 2, 500-1500 XP), SENIOR (Level 3, 1500+ XP).
- **Female Guide Safety Constraint**: For sensitive domestic violence or sexual harassment cases, the engine requires/prioritizes verified female guides.
