# 💜 WealthMind
**Your AI-Powered Premium Financial Companion**

WealthMind is a modern, full-stack personal finance application that bridges the gap between traditional portfolio tracking and advanced, AI-driven behavioral finance. With a bespoke "Lavender Mist" aesthetic, an intuitive interface, and deep intelligence powered by Bytez.js, WealthMind is built for investors who want to understand the *why* behind their wealth.

<img width="1885" height="879" alt="image" src="https://github.com/user-attachments/assets/02722822-547b-46d0-a228-87c84499cfe9" />


---

## ✨ Key Features

*   **📊 Dynamic Dashboard**: Track your net worth, total P&L, and asset allocation with beautiful `Recharts` visualizations. Features a simulated 6-month wealth journey growth chart.
*   **💼 Portfolio Manager**: Full CRUD capability. Add assets, track investments vs. current value, monitor real-time profit and loss (P&L), and leverage inline editing.
*   **🎯 Smart Goal Planner**: Create financial milestones and track your progress. Includes an advanced AI-driven SIP Calculator that estimates required monthly investments to hit targets on time.
*   **🤖 AI Financial Advisor**: A chat-based assistant powered by **Bytez.js (`openai/gpt-4.1-mini`)**. Get instant, structured advice (Advice, Why, and Takeaway) specially tailored for the Indian market.
*   **🧠 Behavioral Insights**: Scans your portfolio data to identify cognitive biases (like Home Bias or Concentration Risk) and offers AI-generated remedies.
*   **🌡️ Market Sentiment Gauge**: Complete with a dynamic Fear & Greed index ring to warn you whether the broader market is overheating or oversold.
*   **🔐 Seamless Authentication**: Secured by **Supabase**. Features standard email/password user flows alongside a one-click "Guest Access" mode for instant demos.

---

## 🛠️ Technology Stack

**Frontend**
*   **React 19** & **Vite**: Blazing fast rendering and development.
*   **Tailwind CSS 4**: Custom "Lavender Mist" premium gradient themes and glassmorphism UI.
*   **Lucide React**: Crisp, modern icon system.
*   **Framer Motion**: State-of-the-art micro-interactions and page transitions.
*   **Recharts**: Responsive charting library.

**Backend & Database**
*   **Node.js / Express**: Lightweight, fast, and robust API server.
*   **Supabase (PostgreSQL)**: Handles Authentication, Database (CRUD), and Row Level Security (RLS).
*   **Bytez.js SDK**: The core AI engine routing requests seamlessly to `openai/gpt-4.1-mini`.

---

## 🚀 Getting Started

Follow these steps to get WealthMind running locally on your machine.

### 1. Clone & Install
```bash
git clone https://github.com/your-username/WealthMind.git
cd WealthMind

# Install frontend and backend dependencies
npm install
```

### 2. Configure the Database
1. Create a new project in [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Copy the contents of `supabase_schema.sql` (found in the root directory) and click **Run** to generate your database tables and Row Level Security (RLS) policies.

### 3. Environment Variables
Create a `.env` file in the root of your project:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend Configuration
PORT=5000
```
*(Note: The Bytez API key for the AI is currently embedded in `server/server.ts` for demo purposes. Move it to the `.env` file for production!)*

### 4. Run the Application
You will need two terminal windows to run both the frontend and backend simultaneously.

**Terminal 1 (Backend API Server)**
```bash
npm run server
```
*(Server will start on http://localhost:5000)*

**Terminal 2 (Frontend React App)**
```bash
npm run dev
```
*(App will run on http://localhost:3000)*

---

## 🔮 Future Roadmap
*   **Plaid / Account Aggregator Integration**: Auto-sync bank and brokerage accounts.
*   **Automated Rebalancing**: One-click portfolio rebalancing execution.
*   **Tax Loss Harvesting**: AI-driven suggestions for minimizing capital gains tax.

---

## 📄 License
This project is licensed under the MIT License. Feel free to use, modify, and distribute it as you see fit!
