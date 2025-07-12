# ♻️ ScrapBot: Smart Recycle Chatbot with AI Detection, Live Pricing, SMS & Payments

This is an intelligent chatbot built to streamline scrap collection using AI image detection, live metal pricing and Twilio SMS integration.

## 🔍 Features

- 🧠 AI-powered image detection using a custom YOLO model (`best.pt`)
- 📸 Detects scrap items like metal, plastic, aluminium, etc.
- 💰 Calculates live price of metals via [MetalPriceAPI](https://metalpriceapi.com)
- 📩 Sends pickup requests via SMS using Twilio
- 📍 Captures user location and pickup time

## 🖥️ Tech Stack

- Frontend: HTML, CSS, JS
- Backend: Node.js (Express), Python (Flask)
- ML: YOLOv8 (Ultralytics)
- APIs: OpenAI (optional), MetalPriceAPI, Twilio

---

## 🚀 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/yourusername/smart-recycle-chatbot.git
cd smart-recycle-chatbot
2. Setup Python API
pip install -r requirements.txt
python custom_trained_api.py
Make sure best.pt is placed in the root directory.

3. Setup Node Backend
npm install
node server.js
Server runs on: http://localhost:3000

4. Open the Chatbot
Go to:
http://localhost:3000/bot.html
Upload image → detect → get live prices → confirm pickup → get SMS confirmation.

⚙️ Environment Variables
Create a .env file based on .env.example:

makefile
OPENAI_API_KEY=
TWILIO_SID=
TWILIO_AUTH=
TWILIO_PHONE=
KABADIWALA_PHONE=
📸 Image Detection Example
Upload image of scrap items

Response:

yaml
metal: 2 x ₹58.1 = ₹116.20
tin: 1 x ₹70.42 = ₹70.42

💰 Total: ₹186.62
📲 SMS 
Twilio sends SMS pickup request to Kabadiwala


📦 Deployment (Coming Soon)
Host Node backend on Render / Railway

Deploy Python API on PythonAnywhere

Use ngrok or reverse proxy if needed

🧠 Credits
YOLOv8 by Ultralytics

Twilio Programmable SMS

MetalPriceAPI

