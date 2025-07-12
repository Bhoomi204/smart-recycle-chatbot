from flask import Flask, request, jsonify
import base64
from ultralytics import YOLO
import cv2
import os

app = Flask(__name__)
model = YOLO("best.pt")

@app.route('/detect', methods=['POST'])
def detect():
    # Accept image file upload
    if 'image' not in request.files:
        return jsonify({'error': 'No image file uploaded'}), 400
    file = request.files['image']
    input_path = "input.jpg"
    file.save(input_path)

    results = model(input_path, conf=0.5, iou=0.5)
    annotated = results[0].plot()
    output_path = "result.jpg"
    cv2.imwrite(output_path, annotated)

    names = results[0].names
    detected = results[0].boxes.cls.cpu().numpy()
    counts = {}
    for cls_id in detected:
        name = names[int(cls_id)]
        counts[name] = counts.get(name, 0) + 1

    rates = {'metal': 20, 'plastic': 10, 'glass': 15}
    summary = ""
    for item, count in counts.items():
        rate = rates.get(item, 0)
        summary += f"{item}: {count} x ₹{rate} = ₹{count * rate}\n"

    with open(output_path, "rb") as img_file:
        img_b64 = base64.b64encode(img_file.read()).decode('utf-8')
    os.remove(input_path)
    os.remove(output_path)
    return jsonify({'summary': summary, 'image_base64': img_b64})

if __name__ == "__main__":
    app.run(port=5000)