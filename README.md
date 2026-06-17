<div align="center">

# ✋ Neural Gesture Pipeline

### Real-Time Hand Gesture Recognition using Python, OpenCV & MediaPipe

Detect and classify hand gestures directly from a webcam feed using computer vision and machine learning techniques.

![Python](https://img.shields.io/badge/Python-3.x-blue)
![OpenCV](https://img.shields.io/badge/OpenCV-Computer%20Vision-green)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Hand%20Tracking-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

</div>

---

## 📌 Overview

Neural Gesture Pipeline is a real-time gesture recognition system that uses **MediaPipe Hand Tracking** and **OpenCV** to detect hand landmarks and identify common gestures.

The project demonstrates the complete gesture-recognition workflow:

```text
Webcam Input
     ↓
Hand Detection
     ↓
Landmark Extraction
     ↓
Gesture Classification
     ↓
Output Display
```

---

## ✨ Features

✅ Real-time webcam processing

✅ Accurate hand landmark detection

✅ Open Hand recognition

✅ Fist recognition

✅ Pointing gesture detection

✅ Finger counting

✅ Lightweight and beginner-friendly

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Python | Core Programming |
| OpenCV | Video Processing |
| MediaPipe | Hand Tracking |
| NumPy | Numerical Operations |

---

## 📂 Project Structure

```text
Neural-Gesture-Pipeline/
│
├── gesture.py
├── README.md
├── requirements.txt
└── assets/
```

---

## 🚀 Installation

### 1. Clone Repository

```bash
git clone https://github.com/Agniiiiiman/Neural-Gesture-Pipeline.git
cd Neural-Gesture-Pipeline
```

### 2. Create Virtual Environment

```bash
python -m venv venv
```

Activate:

**Windows**

```bash
venv\Scripts\activate
```

**Linux / macOS**

```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install opencv-python mediapipe numpy
```

---

## ▶️ Run the Project

```bash
python gesture.py
```

Press **Q** to quit the application.

---

## 🧠 How It Works

### Step 1 — Capture Video

The webcam continuously captures frames.

### Step 2 — Detect Hands

MediaPipe detects the hand and extracts 21 landmarks.

### Step 3 — Analyze Finger Positions

The system checks whether each finger is open or closed.

### Step 4 — Classify Gesture

Based on landmark positions, the gesture is recognized.

### Step 5 — Display Result

The detected gesture is shown on the screen in real time.

---

## 🎯 Supported Gestures

| Gesture | Recognition |
|----------|-------------|
| ✊ Fist | All fingers closed |
| 🖐 Open Hand | All fingers open |
| ☝ Pointing | Index finger raised |
| 🔢 Finger Count | Counts raised fingers |

---

## 📸 Demo

Add screenshots or GIFs here.

```md
![Demo](assets/demo.gif)
```

---

## 🔮 Future Improvements

- Sign Language Recognition
- Gesture-based Mouse Control
- Gesture-based Volume Control
- Deep Learning Classification (TensorFlow/PyTorch)
- Multi-Hand Recognition
- Custom Gesture Training

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Open a Pull Request

---

## 👨‍💻 Author

### Agniv Bhattacharjee

🎓 B.Tech CSE (AI & ML)

🔗 GitHub: https://github.com/Agniiiiiman

---

## ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.

---

<div align="center">

### "Bridging Human Interaction and AI through Gesture Recognition"

⭐ Star the repository if you like the project!

</div>
