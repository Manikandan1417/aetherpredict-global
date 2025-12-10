# AetherPredict: Shield AI — Global Disaster Command Center

AI-first disaster intelligence prototype built for the **Google DeepMind Gemini Pro 3 Hackathon on Kaggle** — exploring how multimodal AI can help **predict, assess, and prepare for natural disasters before they strike.** [web:9]

## 🔍 What this project tries to do

Turn a research / ideation thread into a practical **AI disaster command center** that: 
- Fuses **weather, satellite and geospatial signals** into a single intelligence layer 
- Estimates **risk levels and potential impact** on lives and infrastructure 
- Simulates **early alerts and response actions** instead of waiting for post-event analytics  

Kaggle writeup (concept + flow):  
https://kaggle.com/competitions/gemini-3/writeups/aetherpredict-shield-ai-disaster-command-center 

## ⚙️ Key capabilities

- **Multimodal Gemini reasoning**  
  Uses Gemini models to interpret structured data, text signals, and scenario prompts for disaster risk narratives. 

- **Data fusion layer**  
  - Weather + forecast feeds  
  - Geospatial region / city context 
  - Temporal windows for pre‑event, live, and post‑event analysis  

- **Multimodal ensemble logic**  
  - Combines outputs from multiple AI “skills” (forecast, severity scoring, impact estimation) 
  - Aggregates into a unified **risk score + recommended action set**  

- **Human-in-the-loop design**  
  The system is meant as a **decision support layer**, not an autonomous decision maker. 

## 🧱 Tech stack

- **AI**: Gemini Pro 3 (via Google AI Studio API) 
- **Backend / Orchestration**: Python / Node.js (update to match your actual stack)  
- **Frontend**: Next.js / React (deployed on Vercel – currently under fixes) 
- **Data**: Weather APIs, basic geospatial metadata, JSON-based scenario configs 

_Update the items above to exactly match what you use in this repo._

## 🚀 Running locally
git clone https://github.com/Manikandan1417/aetherpredict-global
cd aetherpredict-global
Example: Node/Next.js flow – adjust if your stack differs

cp .env.example .env.local # add your Gemini + API keys

npm install
npm run dev


## 🧪 Current status

- ✅ Core idea and flows designed for the **Gemini 3 Hackathon**
- ✅ Kaggle writeup live   
- 🚧 Vercel deployment under maintenance / fixes   
- 🔜 Next steps: better visual dashboards, more robust data sources, and improved risk calibration   

---

If you have ideas on improving **AI‑assisted disaster management**, feel free to open an issue or share suggestions.


