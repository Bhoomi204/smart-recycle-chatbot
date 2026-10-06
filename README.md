# 🤖 ScrapBot — AI Scrap Detection, Real-Time Valuation & Dispatch Engine

> **Module 1 of the [SustaShelf Circular Economy Platform](https://github.com/Bhoomi204/SustaShelf)**  
> **ScrapBot** is an operational AI chatbot micro-system that identifies household and industrial recyclables from photos, estimates instant monetary payouts using live metal spot prices, and dispatches automated SMS pickup alerts to local scrap collectors (*Kabadiwalas*).

---

## ⚙️ Micro-Service Architecture & Workflow

ScrapBot combines two backend micro-services (Python Flask + Node.js Express) working in sync with a responsive frontend client (`bot.html`):

```
                               ┌─────────────────────────────────────────┐
                               │            Client (bot.html)            │
                               └────────────────────┬────────────────────┘
                                                    │
                                         1. Upload Scrap Image
                                                    │
                                                    ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Python Flask Server (custom_trained_api.py - Port 5000)                                              │
│                                                                                                       │
│   ┌────────────────────────────────┐         ┌─────────────────────────────────────────────────────┐  │
│   │ Custom YOLOv8m Vision Engine   │ ──────► │ MetalPriceAPI Spot Valuation                        │  │
│   │ (Detection model/weights/best.pt)│        │ (Item Counts × Live Spot Prices = Itemized Valuation)│  │
│   └────────────────────────────────┘         └──────────────────────────┬──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┼─────────────────────────────┘
                                                                          │
                                                          2. Returns Breakdown & Valuation
                                                                          │
                                                                          ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  Node.js / Express Dispatch Server (server.js - Port 3000)                                            │
│                                                                                                       │
│   Captures user geolocation, preferred schedule, and itemized payout details.                          │
│   Dispatches structured SMS dispatch alert via Twilio Programmable SMS API.                            │
└─────────────────────────────────────────┬─────────────────────────────────────────────────────────────┘
                                          │
                               3. Automated Dispatch SMS
                                          │
                                          ▼
                         📱 Local Scrap Collector (Kabadiwala)
```

---

## 🧠 Custom YOLOv8 Vision Model Performance

The identification layer uses a fine-tuned **YOLOv8 Medium (`yolov8m.pt`)** vision model trained on NVIDIA Tesla T4 GPUs across a 17-class recyclable materials dataset.

### Evaluation Metrics Summary

| Metric | Score / Benchmark |
| :--- | :--- |
| **Architecture** | Fine-tuned `yolov8m.pt` |
| **Model Parameters** | 25.8M parameters / 78.7 GFLOPs |
| **Precision ($P$)** | **$0.499$** |
| **Recall ($R$)** | **$0.406$** |
| **mAP@50** | **$42.4\%$** |
| **mAP@50-95** | **$35.5\%$** |
| **Inference Speed** | **$\sim 10.5\text{ ms / image}$** (Tesla T4) |

### Class Accuracy Highlights ($mAP@50$)
* 📦 **Cardboard:** $83.1\%$
* 🔍 **Camera Lens:** $69.5\%$
* 🚗 **Car Body:** $66.6\%$
* 🥫 **Disposable Aluminium:** $63.5\%$
* 🛢️ **Tin Can:** $54.8\%$
* 🔌 **Copper Wires:** $49.6\%$

---

## 🛠️ Repository Directory Hierarchy

```text
smart-recycle-chatbot/
├── Detection model/
│   └── weights/
│       └── best.pt               # Trained YOLOv8 weights (52MB)
├── bot.html                      # Interactive web chatbot interface
├── style.css                     # Responsive styling
├── custom_trained_api.py         # Flask server (Inference & MetalPriceAPI)
├── server.js                     # Express server (Twilio SMS dispatch)
├── package.json                  # Node dependencies
├── requirements.txt              # Python dependencies
├── .env.example                  # Environment variables template
└── README.md                     # Module documentation
```

---

## 🚀 Quickstart & Local Setup Guide

### 1. Prerequisites
* **Python 3.11+** installed
* **Node.js v18+** installed
* Active **MetalPriceAPI** key and **Twilio** account credentials

### 2. Environment Configuration
Create a `.env` file in the repository root based on `.env.example`:

```env
PORT=3000
METAL_PRICE_API_KEY=your_metalprice_api_key
TWILIO_SID=your_twilio_account_sid
TWILIO_AUTH=your_twilio_auth_token
TWILIO_PHONE=your_twilio_virtual_phone_number
KABADIWALA_PHONE=registered_collector_phone_number
```

### 3. Launch Flask ML & Valuation Server (Port 5000)
```bash
# Install Python dependencies
pip install -r requirements.txt

# Run the Flask API
python custom_trained_api.py
```

### 4. Launch Node.js Express Dispatch Server (Port 3000)
In a new terminal window:
```bash
# Install Node dependencies
npm install

# Start Express server
node server.js
```

### 5. Access ScrapBot
Open your browser and navigate to:
```text
http://localhost:3000/bot.html
```

---

## 🔌 API Endpoints & Contract

### 1. Flask Inference & Valuation API (`custom_trained_api.py`)
* **Endpoint:** `POST /predict`
* **Content-Type:** `multipart/form-data`
* **Payload:** `file` (Image file)
* **Response:**
  ```json
  {
    "status": "success",
    "detections": [
      { "class": "cardboard", "count": 2, "unit_price": 15.0, "subtotal": 30.0 },
      { "class": "tin-can", "count": 1, "unit_price": 70.42, "subtotal": 70.42 }
    ],
    "total_estimated_value": 100.42,
    "currency": "INR"
  }
  ```

### 2. Express Logistics Dispatch Service (`server.js`)
* **Endpoint:** `POST /send-pickup-sms`
* **Content-Type:** `application/json`
* **Payload:**
  ```json
  {
    "address": "Sector 14, Block B, Flat 201",
    "preferredTime": "4:00 PM - 6:00 PM",
    "items": "2x Cardboard, 1x Tin Can",
    "totalValue": "₹100.42"
  }
  ```
* **Response:**
  ```json
  {
    "success": true,
    "messageSid": "SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
  }
  ```

---

## 🔗 Part of the SustaShelf Ecosystem

ScrapBot serves as the operational transaction layer for **SustaShelf**. For strategic market forecasting, price analytics dashboards, and overarching architecture details, visit the main repository:

👉 **[View Main SustaShelf Repository](https://github.com/Bhoomi204/SustaShelf)**

---

* Powered by [Ultralytics YOLOv8](https://docs.ultralytics.com/), [MetalPriceAPI](https://metalpriceapi.com/), and [Twilio API](https://www.twilio.com/).
