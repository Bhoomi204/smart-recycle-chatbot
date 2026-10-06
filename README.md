# ♻️ SustaShelf | Smart Scrap Management & AI Valuation Platform

**SustaShelf (ScrapBot)** is an end-to-end AI-powered scrap recycling and real-time valuation ecosystem. It bridges custom computer vision with live commodity pricing to automate recyclable material identification, scrap valuation, automated pickup dispatches, and long-term commodity price forecasting.

---

## 📌 Key Features

* 🧠 **AI-Powered Object Detection:** Custom-trained **YOLOv8** model fine-tuned on a 17-class waste sorting dataset to detect materials such as cardboard, plastics, tin cans, copper wire, and stainless steel.
* 💰 **Real-Time Scrap Valuation:** Automated valuation engine pairing detected class counts with live metal market prices via **MetalPriceAPI**.
* 📲 **Automated Dispatch System:** Express backend integrated with **Twilio Programmable SMS** to route pickup requests with user location and scheduled pickup times to local collectors (*Kabadiwala*).
* 📊 **Market Predictive Analytics:** **Prophet**-driven Streamlit dashboard providing 6-month price trend forecasting for key industrial metals ($Cu$, $Al$, $Ni$, $Li$, $Co$).
* 💬 **Interactive User Interface:** Responsive web client (`bot.html`) enabling instant photo upload, detection confirmation, itemized bill breakdown, and scheduling.

---

## 🏗️ System Architecture & Data Flow

```
┌─────────────────┐       ┌────────────────────────┐       ┌───────────────────────┐
│                 │       │  Flask Computer Vision │       │  Live Commodity Rates │
│  Client UI      ├──────►│  & Valuation API       │◄──────┤  (MetalPriceAPI)      │
│  (bot.html)     │       │  (custom_trained_api)  │       └───────────────────────┘
└────────┬────────┘       └───────────┬────────────┘
         │                            │
         │ Request Pickup             │ Class Counts & Estimated Value
         ▼                            ▼
┌──────────────────────────────────────────────────┐       ┌───────────────────────┐
│ Node.js / Express Backend Server (server.js)     ├──────►│ Twilio SMS Dispatch   │
└──────────────────────────────────────────────────┘       │ (To Scrap Collector)  │
                                                           └───────────────────────┘
```

1. **Vision Inference:** User uploads a scrap photo via `bot.html`. Flask API passes the image to the custom YOLOv8 model (`best.pt`).
2. **Pricing Engine:** Flask service matches identified objects against real-time spot rates from MetalPriceAPI to compute itemized and total values.
3. **Dispatch & SMS:** On user confirmation, Node.js captures pickup time and location, formatting and triggering an automated SMS via Twilio.

---

## 🧠 Model Architecture & Training Metrics

The vision pipeline uses a custom-trained **YOLOv8 Medium (`yolov8m.pt`)** object detector trained on NVIDIA Tesla T4 GPUs via PyTorch and Ultralytics.

### Model Metrics Summary

* **Base Weights:** `yolov8m.pt` (25.8M parameters | 78.7 GFLOPs)
* **Dataset Classes:** 17 Classes (*Cardboard, Tin Can, Plastic, Copper Wires, Stainless Steel, Car Body, Disposable Aluminium, etc.*)
* **Precision ($P$):** $0.499$
* **Recall ($R$):** $0.406$
* **mAP@50:** **$42.4\%$**
* **mAP@50-95:** **$35.5\%$**
* **Inference Speed:** $\sim 10.5\text{ ms / frame}$ on GPU

#### Key Class Performances ($mAP@50$):
* 📦 **Cardboard:** $83.1\%$
* 🔍 **Camera Lens:** $69.5\%$
* 🚗 **Car Body:** $66.6\%$
* 🥫 **Disposable Aluminium:** $63.5\%$
* 🛢️ **Tin Can:** $54.8\%$

---

## 📂 Repository Structure

```text
smart-recycle-chatbot/
├── Detection model/
│   └── weights/
│       └── best.pt               # Fine-tuned YOLOv8 model weights
├── uploads/                      # Temporary image storage for inference
├── bot.html                      # Frontend chatbot interface
├── style.css                     # UI styling
├── custom_trained_api.py         # Flask server (YOLOv8 inference & MetalPriceAPI)
├── server.js                     # Express server (Main backend & Twilio integration)
├── .env.example                  # Environment configuration template
├── package.json                  # Node.js dependencies
└── README.md                     # Project documentation
```

---

## 🛠️ Tech Stack

* **Computer Vision & Forecasting:** Python, Ultralytics YOLOv8, PyTorch, Prophet, Streamlit
* **Backend Services:** Node.js, Express.js, Flask
* **Frontend:** HTML5, CSS3, JavaScript (Fetch API)
* **APIs & Cloud Tools:** MetalPriceAPI, Twilio Programmable SMS, OpenAI API (optional)

---

## 🚀 Getting Started

### Prerequisites
* **Python:** 3.11 or higher
* **Node.js:** v18 or higher
* **npm:** v9 or higher

---

### 1. Installation

Clone the repository and install both Python and Node dependencies:

```bash
# Clone repository
git clone https://github.com/Bhoomi204/smart-recycle-chatbot.git
cd smart-recycle-chatbot

# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
```

*(Note: Ensure `ultralytics`, `flask`, `requests`, and `torch` are included in your `requirements.txt`).*

---

### 2. Environment Configuration

Create a `.env` file in the root directory based on `.env.example`:

```env
# Server Port
PORT=3000

# API Keys
OPENAI_API_KEY=your_openai_key_optional
METAL_PRICE_API_KEY=your_metalpriceapi_key

# Twilio SMS Credentials
TWILIO_SID=your_twilio_account_sid
TWILIO_AUTH=your_twilio_auth_token
TWILIO_PHONE=your_twilio_virtual_phone_number
KABADIWALA_PHONE=collector_phone_number
```

---

### 3. Execution

1. **Start the Flask Vision API:**
   ```bash
   python custom_trained_api.py
   ```
   *Runs on `http://localhost:5000`*

2. **Start the Express Server:**
   ```bash
   node server.js
   ```
   *Runs on `http://localhost:3000`*

3. **Access the Chatbot:**
   Open your browser and navigate to `http://localhost:3000/bot.html`.

---

## 💬 Sample Valuation & SMS Output

### Valuation Output Example:
```text
Itemized Detection & Valuation:
• Cardboard  : 2 x ₹15.00 = ₹30.00
• Tin Can    : 3 x ₹22.50 = ₹67.50
• Plastic    : 1 x ₹12.00 = ₹12.00
------------------------------------
Total Estimated Value: ₹109.50
```

### Automated Twilio SMS Payload:
> *"📦 **New Pickup Scheduled!**\nLocation: Sector 14, Main Gate\nTime: 04:30 PM\nEstimated Items: Cardboard (2), Tin Can (3), Plastic (1)\nEstimated Value: ₹109.50"*

---
