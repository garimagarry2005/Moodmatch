import sys
import json
import cv2
import torch
from transformers import AutoImageProcessor, AutoModelForImageClassification
from PIL import Image
import numpy as np

# Load model and processor once globally for efficiency
processor = AutoImageProcessor.from_pretrained("nateraw/ferplus-bert")
model = AutoModelForImageClassification.from_pretrained("nateraw/ferplus-bert")

def read_image_from_stdin():
    data = sys.stdin.buffer.read()
    image = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR)
    return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

try:
    image = read_image_from_stdin()
    pil_image = Image.fromarray(image)

    inputs = processor(images=pil_image, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
        predicted_class = outputs.logits.argmax(-1).item()
        emotion = model.config.id2label[predicted_class]

    print("✅ Image received and processing started...", flush=True)
    print(json.dumps({ "mood": emotion }))
except Exception as e:
    print(json.dumps({ "error": str(e) }))
