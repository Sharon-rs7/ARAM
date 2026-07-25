# Final Project Structure Report

This report maps the final, clean, and review-ready structure of the ARAM platform.

## 1. Directory Tree & Functionality

```text
E:\prgt\New folder\aram
├── src                         # React Frontend Source
│   ├── components              # Reusable UI widgets & sections
│   ├── context                 # Global State Contexts (Auth, Theme)
│   ├── data                    # Seed data & client mock configurations
│   ├── hooks                   # Activity tracking & utility hooks
│   ├── pages                   # Role-based workspace page views
│   ├── routes                  # Navigation protection guards
│   ├── services                # API client request wrappers
│   ├── styles                  # CSS modules
│   └── utils                   # Helper algorithms (text formats, role labels)
├── public                      # Static PWA and cache manifest files
├── aram-backend                # Spring Boot Java Server
│   ├── src/main/java           # JPA entities, services, controllers
│   └── src/main/resources      # MySQL properties & seed scripts
├── ai-service                  # Python FastAPI AI Service
│   ├── app                     # Router endpoints & triage logic
│   └── datasets                # Recommendation match CSV training logs
├── postman                     # Postman API test collection files
├──package.json                 # Node dependencies configuration
├── vite.config.js              # Vite compiler configuration
├── tailwind.config.js          # Tailwind CSS settings
└── README.md                   # Platform documentation
```

---

## 2. Directory Mappings
- **Frontend Contexts:** Managed under `src/context/` (Auth, Theme).
- **Backend Architecture:** Separated by package layers (model, repository, service, controller, config, security).
- **AI Datasets:** Stored under `ai-service/datasets/` and pre-seeded inside `aram-backend/src/main/resources/` for ranking model lookups.
- **Obsolete directories removed:** `src/layouts` (Empty folder).
