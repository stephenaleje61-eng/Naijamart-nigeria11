# NaijaHub Africa - Setup & Architecture Guide
**Tagline:** *Discover Opportunities. Grow Businesses. Learn Skills. Connect Africa.*

---

## 1. Overview & Core Architecture
NaijaHub Africa is built directly inside this project under `/naijahub` and integrated into the React frontend.

### Brand Identity
- **Primary Color:** `#075B43` (Deep African Emerald Forest)
- **Secondary Accent:** `#0D9B72` (Lush Green)
- **Gold Highlight:** `#F5B942` (Warm African Sun Gold)
- **Backgrounds:** `#FFFFFF` (Pristine White) and `#F8F7F2` (Warm Saharan Cream)
- **Typography & Dark Contrast:** `#17231F` (Charcoal Slate)

### Core UX Rules
1. **NO LOGIN WALL:** Visitors can 100% publicly browse the homepage, search across all 36 Nigerian states + FCT, view business showcases, explore farm produce, browse jobs, and use SolveAI calculators without being asked to register.
2. **Contextual Action Modals:** An authentication modal is presented ONLY when a guest takes an active action:
   - Publishing a business or product listing
   - Submitting a job application with CV upload
   - Submitting a product or business review
   - Sending direct messages / friend requests
3. **Real Geolocation (Near Me):**
   - Geolocation is requested **strictly on user click** ("Explore Near Me").
   - When granted, uses the **Haversine formula** to calculate distance in km and badge listings (e.g. `1.2km away`).
   - If denied, defaults to nationwide view and displays a subtle notification once without re-prompting.
4. **Zero Frontend Gemini Key Exposure:**
   - All AI interactions run through the Firebase Cloud Function at `/naijahub/functions/index.js` which verifies inputs, applies rate limits (30 req/min/IP), and interfaces with `gemini-2.5-flash`.

---

## 2. Directory Structure
```
/naijahub/
├── firebase.json              # Firebase project configuration
├── firestore.rules            # Security rules for all 4 modules
├── storage.rules              # Storage rules for products, farm produce & CV uploads
├── .env.example               # Environment variables template
├── SETUP_GUIDE.md             # This comprehensive architecture manual
└── functions/                 # Backend Cloud Functions
    ├── package.json
    └── index.js               # solveAiAssistant HTTPS endpoint with rate limiting

/src/naijahub/                 # React UI implementation
├── types.ts                   # Strongly-typed data models
├── NaijaHubPortal.tsx         # Main responsive portal & navigation
└── modules/
    ├── NaijaBusinessModule.tsx  # Business directories, CAC badges, WhatsApp links, operating hours
    ├── FarmLinkModule.tsx       # Direct farm-to-buyer, custom units (kg, bags, crates, tonnes), bulk calculator
    ├── SkillBridgeModule.tsx    # Job board with CV PDF upload, freelancer directory
    └── SolveAIModule.tsx        # Interactive multi-graph practical lab, formula calculators, AI tutor
```

---

## 3. The 4 Modules & Firestore Collections

### Module 1: NaijaBusiness (`businessProfiles` & `productListings`)
- Verified Badges: Gold CAC Verified / Community Verified.
- Real-time Operating Hours: Evaluated against `Africa/Lagos` timezone.
- One-click WhatsApp link with prefilled contextual text (`wa.me/234...`).
- Multi-photo product showcase with stock pills (*In Stock*, *Pre-order*, *Out of Stock*).
- Star rating and customer reviews.

### Module 2: FarmLink Africa (`farmListings`)
- Farm-to-buyer direct trading without middleman markups.
- Standard Nigerian agricultural units: `kg`, `bag (50kg)`, `bag (100kg)`, `crate`, `tonne`, `basket`.
- Minimum Order Quantity (MOQ) and harvest readiness dates.
- Logistics toggle: "Seller can arrange delivery" vs "Buyer to arrange pickup".
- Bulk Purchase Inquiry calculator modal.

### Module 3: SkillBridge Africa (`jobListings`, `freelancerProfiles`, `jobApplications`)
- Categorized jobs: Full-time, Part-time, Remote, Contract, Internship, Apprenticeship.
- One-click CV upload to Firebase Storage path `/cvs/{uid}/{timestamp}_{filename}`.
- Freelancer skill cards with hourly rates in Naira (₦) and portfolio links.

### Module 4: SolveAI Learning (`learningSessions`)
- Interactive Multi-Graph Practical Lab:
  - Custom X and Y data points in an editable dynamic table.
  - Live linear regression computation:
    $$m = \frac{N\sum(xy) - \sum x \sum y}{N\sum(x^2) - (\sum x)^2}$$
    $$c = \frac{\sum y - m\sum x}{N}$$
    $$r = \text{Pearson correlation coefficient}$$
  - Export graph directly as PNG for student lab reports.
- Real Nigerian problem calculators:
  - Loan amortization with monthly payment and interest breakdown.
  - Farm yield per hectare and fertilizer requirements.
  - Solar power system sizing (battery Ah, inverter kVA, solar panels).
  - Profit margin & markup calculator.

---

## 4. Deployment Instructions

### A. Deploy Security Rules
```bash
firebase deploy --only firestore:rules,storage
```

### B. Configure Gemini Secret in Cloud Functions
```bash
firebase functions:secrets:set GEMINI_API_KEY
# Enter your Gemini API key when prompted
```

### C. Deploy Cloud Functions
```bash
firebase deploy --only functions
```

### D. Build and Deploy Hosting
```bash
npm run build
firebase deploy --only hosting
```
