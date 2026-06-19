# 🌱 Samatva: AI-Powered Eco Assistant

Samatva is an intelligent, gamified platform designed to solve **[Challenge 3]**. It goes beyond simple calculators by dynamically mapping your lifestyle, tracking your progress against the Paris 2030 climate goals, and utilizing Generative AI to generate hyper-personalized, trackable daily actions to reduce your emissions.

---

## 📌 Chosen Vertical
**Sustainability & Climate Tech** (Carbon Footprint Awareness Platform)

Samatva specifically targets the disconnect between global climate awareness and individual action. By translating abstract carbon tonnes into simple, personalized daily micro-actions, we empower individuals to actively participate in the solution.

---

## 🧠 Approach and Logic

Our core logic is built on the premise that **awareness without action is ineffective.** Most eco-apps fail because they stop at acting as a static calculator. Our approach bridges that gap by merging high-accuracy carbon modeling with AI-driven gamification. 

To achieve 100% problem statement alignment ("*understand, track, and reduce... through simple actions and personalized insights*"), we architected the platform around four logical pillars:
1. **Understand (Granular Modeling)**: We don't just ask for generic data. We model specific lifestyle vectors (e.g., kWh of grid vs. renewable energy, specific diet archetypes, flights per year) to calculate a highly accurate live footprint.
2. **Track (Visual Progress)**: We visualize the user's footprint against the Paris 2030 targets and maintain a historical 6-month trend line to visually reinforce positive behavioral changes.
3. **Personalized Insights (AI Brain)**: Instead of generic advice, we feed the user's exact emission breakdown (Travel, Home, Diet, Consumption) into Google's **Gemini 2.5 Flash** model. 
4. **Reduce via Simple Actions (ActionHub)**: The AI generates *custom, clickable* daily tasks tailored to the user's highest emission categories. Completing these tasks builds a "Green Streak," rewards eco-points, and actively subtracts kg CO₂e from their live footprint.

---

## ⚙️ How the Solution Works

1. **Dynamic Assessment**: The user completes an onboarding calculator detailing their travel habits, home energy usage, and consumption behaviors. The app calculates their live annual CO₂e footprint in tonnes.
2. **Interactive Global Benchmarking**: A dynamic 3D globe visualization allows users to compare their personal footprint against the average citizen in countries worldwide, providing global context to their lifestyle.
3. **AI-Driven Personalization**: The user clicks "Generate Personalized Actions" in the ActionHub. The app securely calls a server-side TanStack function, passing their footprint breakdown to the Gemini API. Gemini returns 3 highly tailored, trackable daily actions (e.g., "Because your transport emissions are high, try taking the bus today for +15 pts").
4. **Gamified Tracking Loop**: Users complete actions in the "ActionHub" to build their Green Streak. The system dynamically reduces their live carbon footprint metrics based on the specific CO₂e savings of the logged actions, providing instant positive reinforcement.
5. **Eco Assistant**: A continuous chat interface powered by Gemini is always available for the user to ask highly specific questions regarding their unique carbon footprint data.

---

## 📝 Assumptions Made

1. **Standardized Coefficients**: We assume standard EPA/IPCC average emission coefficients for our mathematical models (e.g., a standard kg CO₂e per kWh, average car emissions per km). True real-world tracking would require direct integration with the user's utility providers.
2. **User Honesty**: The gamification and Green Streak system currently relies on the honor system for logging completed actions. 
3. **Static Action Equivalency**: We assume that completing a daily action saves a static, estimated amount of kg CO₂e (as modeled by the AI) rather than utilizing live telemetry data.
4. **Security Posture**: We assumed deployment requires high security for API credentials. Therefore, no Gemini API keys are exposed on the client. All AI generation is safely sandboxed and executed in TanStack server functions.

---

## 🚀 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide React (for iconography)
- **Framework**: TanStack Start (for secure Server Functions)
- **Artificial Intelligence**: Google Gemini API (`gemini-2.5-flash`) via `@google/generative-ai`
- **Backend/Security**: Prepared for Firebase App Check & Firestore

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
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Run the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser to the local address provided (typically `http://localhost:5173` or `http://localhost:8080`).