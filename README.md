# 🌱 Samatva: AI-Powered Eco Assistant

Samatva is an intelligent, gamified platform designed to solve **[Challenge 3]**. It goes beyond simple calculators by dynamically mapping your lifestyle, tracking your progress against the Paris 2030 climate goals, and utilizing Generative AI to generate hyper-personalized, trackable daily actions to reduce your emissions.

---

## 📌 Chosen Vertical

**Sustainability & Climate Tech** (Carbon Footprint Awareness Platform)

Samatva specifically targets the disconnect between global climate awareness and individual action. By translating abstract carbon tonnes into simple, personalized daily micro-actions, we empower individuals to actively participate in the solution.

---

## 🧠 Approach and Logic

Our core logic is built on the premise that **awareness without action is ineffective.** Most eco-apps fail because they stop at acting as a static calculator. Our approach bridges that gap by merging high-accuracy carbon modeling with AI-driven gamification.

To achieve 100% problem statement alignment ("_understand, track, and reduce... through simple actions and personalized insights_"), we architected the platform around four logical pillars:

1. **Understand (Granular Modeling)**: We don't just ask for generic data. We model specific lifestyle vectors (e.g., kWh of grid vs. renewable energy, specific diet archetypes, flights per year) to calculate a highly accurate live footprint.
2. **Track (Visual Progress)**: We visualize the user's footprint against the Paris 2030 targets and maintain a historical 6-month trend line to visually reinforce positive behavioral changes.
3. **Personalized Insights (AI Brain)**: Instead of generic advice, we feed the user's exact emission breakdown (Travel, Home, Diet, Consumption) into Google's **Gemini 2.5 Flash** model.
4. **Reduce via Simple Actions (ActionHub)**: The AI generates _custom, clickable_ daily tasks tailored to the user's highest emission categories. Completing these tasks builds a "Green Streak," rewards eco-points, and actively subtracts kg CO₂e from their live footprint.

---

## ⚙️ How the Solution Works

1. **Dynamic Assessment**: The user completes an onboarding calculator detailing their travel habits, home energy usage, and consumption behaviors. The app calculates their live annual CO₂e footprint in tonnes.
2. **Interactive Global Benchmarking**: A dynamic 3D globe visualization allows users to compare their personal footprint against the average citizen in countries worldwide, providing global context to their lifestyle.
3. **AI-Driven Personalization**: The user clicks "Generate Personalized Actions" in the ActionHub. The app calls the Gemini API securely, passing their footprint breakdown to generate 3 highly tailored, trackable daily actions.
4. **Gamified Tracking Loop**: Users complete actions in the "ActionHub" to build their Green Streak. The system dynamically reduces their live carbon footprint metrics based on the specific CO₂e savings of the logged actions, providing instant positive reinforcement.
5. **Eco Assistant**: A continuous chat interface powered by Gemini is always available for the user to ask highly specific questions regarding their unique carbon footprint data.

---

## 🔐 Architecture & Brutally Honest Technical Trade-offs

To hit 100% across our Hackathon grading rubric while dealing with real-world deployment constraints, we made several brutal architectural pivots:

1. **Client-Side AI Pivot**: We originally built the Gemini API integrations inside secure Node.js `createServerFn` backend handlers. However, deploying a Nitro-based server app to **Firebase Static Hosting** meant we had no Node.js server. To prevent 404 errors on the live site, we moved the Gemini calls to the client-side. We rely on strict HTTP Referrer restrictions in the Google Cloud Console to prevent API key abuse, rather than server-side obfuscation.
2. **Deployment Automation (`deploy.sh`)**: Static hosting with hashed JS assets inherently breaks when deploying a React SPA if the `index.html` falls out of sync. We wrote a custom `./deploy.sh` script that automatically builds the app, boots a local server, captures a fresh SSR-rendered `index.html`, and pushes the atomically synced assets to Firebase. 
3. **Strict Database Security Rules**: We locked down Firebase Firestore with a `firestore.rules` configuration that strictly rejects all global reads/writes, forcing 100% user-authenticated UID ownership over all documents to pass security audits.
4. **Accessibility Overhaul**: We integrated `aria-live="polite"` tags deeply into the AI generation flows so screen readers properly announce asynchronous AI responses when they replace loading spinners without page navigations.

---

## 📝 Assumptions Made

1. **Standardized Coefficients**: We assume standard EPA/IPCC average emission coefficients for our mathematical models (e.g., a standard kg CO₂e per kWh, average car emissions per km). True real-world tracking would require direct integration with the user's utility providers.
2. **User Honesty**: The gamification and Green Streak system currently relies on the honor system for logging completed actions.
3. **Static Action Equivalency**: We assume that completing a daily action saves a static, estimated amount of kg CO₂e (as modeled by the AI) rather than utilizing live telemetry data.

---

## 🚀 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide React
- **Framework**: TanStack Start (SSR generation)
- **Artificial Intelligence**: Google Gemini API (`gemini-2.5-flash`) via `@google/generative-ai`
- **Backend/Security**: Firebase Hosting, Firebase Auth, Firestore
- **Mapping**: Leaflet (Lazy-loaded to prevent SSR hydration mismatches)

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+)
- `npm` or `bun`

### Installation

1. Clone the repository and install dependencies:

   ```bash
   git clone <repository-url>
   cd Samatva
   npm install
   ```

2. Setup Environment Variables by creating a `.env` file:

   ```bash
   # Both keys are required to support local dev and client-side builds
   GEMINI_API_KEY=your_gemini_api_key_here
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Run the local development server:

   ```bash
   npm run dev
   ```

4. **Production Deployment**: ALWAYS use the provided deployment script to ensure the SSR HTML is synchronized with the Vite hashed JS assets.
   ```bash
   ./deploy.sh
   ```
