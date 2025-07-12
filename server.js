let lastDetectionSummary = '';
let lastDetectionTotal = 0;
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const axios = require('axios');
require('dotenv').config();
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);


const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // serve bot.html

const upload = multer({ dest: 'uploads/' });


async function getLiveMetalPrices(metals) {
  const apiKey = "YOUR_METALPRICEAPI_KEY"; // 🔁 Replace with your real key
  const url = `https://api.metalpriceapi.com/v1/latest?api_key=${apiKey}&base=USD&currencies=INR&symbols=${metals.join(",")}`;

  try {
    const response = await axios.get(url);
    const prices = {};
    for (let metal of metals) {
      const usdPerOunce = response.data.rates[metal];
      const inrPerGram = (usdPerOunce * 83.0) / 28.3495; // USD→INR, Ounce→Gram
      prices[metal] = parseFloat(inrPerGram.toFixed(2));
    }
    return prices;
  } catch (err) {
    console.error("Error fetching live prices:", err.message);
    return {}; // fallback if failed
  }
}


app.post('/chat', upload.single('image'), async (req, res) => {
  const userMsg = req.body.message;

  // If the user uploaded an image and asked for detection
  if (req.file && userMsg && userMsg.toLowerCase().includes("detect")) {
    // Send image to Python Flask API
    const fs = require('fs');
    const FormData = require('form-data');
    const form = new FormData();
    form.append('image', fs.createReadStream(req.file.path));
    try {
      const response = await axios.post('http://127.0.0.1:5000/detect', form, {
        headers: form.getHeaders(),
      });
      const { summary, image_base64 } = response.data;

      // 🔍 Extract metal names and quantities
      const lines = summary.split('\n');
      const metalsDetected = {};
      for (let line of lines) {
        const match = line.match(/(\w+): (\d+)/); // matches: metal: 2
        if (match) metalsDetected[match[1].toLowerCase()] = parseInt(match[2]);
      }

      const metalNames = Object.keys(metalsDetected);

      // ✅ Fetch live prices
      const livePrices = await getLiveMetalPrices(metalNames.map(m => m.toUpperCase()));

      // 🧮 Build new pricing summary
      let total = 0;
      let priceSummary = '';
      for (let metal of metalNames) {
        const qty = metalsDetected[metal];
        const price = livePrices[metal.toUpperCase()] || 10; // fallback ₹10 if not found
        const itemTotal = qty * price;
        total += itemTotal;
        priceSummary += `${metal}: ${qty} x ₹${price} = ₹${itemTotal.toFixed(2)}\n`;
      }

      priceSummary += `\n💰 Total Value: ₹${total.toFixed(2)}`;

      // 💾 Save last detection summary + total for later use in SMS
      lastDetectionSummary = priceSummary;
      lastDetectionTotal = total;


      res.json({
        reply: `Detection result:\n${priceSummary}\n\n📦 To confirm pickup, share location and time.`,
        image: `data:image/jpeg;base64,${image_base64}`
      });
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.json({
        reply: `Detection result:\n${summary}\n\n📦 If you want to confirm pickup, please share your 📍location and 🕒 preferred time.`,
        image: `data:image/jpeg;base64,${image_base64}`
      });
    } catch (err) {
      console.error("Detection error:", err.response?.data || err.message);  // ✅ Add this
      res.json({ reply: "Detection failed. Please try again." });
    }
  } else if (/location.*\d+.*(am|pm)/i.test(userMsg)) {
    const messageBody = `📦 Pickup Request:
${lastDetectionSummary.trim()}

🕒 Preferred Time & 📍Location:
${userMsg}`;

    try {
      await client.messages.create({
        body: messageBody,
        from: process.env.TWILIO_PHONE,
        to: process.env.KABADIWALA_PHONE
      });

      res.json({
        reply: "✅ Thank you! Your pickup has been scheduled. Kabadiwala will reach you on time."
      });
    } catch (error) {
      console.error("SMS failed:", error.message);
      res.json({
        reply: "⚠️ We couldn't notify the kabadiwala due to a technical issue. Please try again later."
      });
    }
  }
  else {
    // Default chatbot reply
    res.json({
      reply: `You said: ${userMsg}. We'll schedule your pickup soon! Upload image of scrap and type "detect".`
    });
  }

});

app.listen(3000, () => console.log('Server running at http://localhost:3000'));