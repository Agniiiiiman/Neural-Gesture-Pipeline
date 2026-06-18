import cv2
import logging
import time
import os
from gesture_pipeline.detector import HandDetector, open_camera
from gesture_pipeline.recognizer import GestureRecognizer
from gesture_pipeline import config

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def main():
    # Initialize detector and recognizer from the modular package
    detector = HandDetector()
    recognizer = GestureRecognizer()
    
    # Open camera based on config
    cap = open_camera(config.CAMERA_INDEX)
    
    print("Neural Gesture Pipeline is running...")
    print(f"Press '{config.QUIT_KEY}' to exit.")
    print(f"Press '{config.SCREENSHOT_KEY}' to save a screenshot.")
    
    prev_time = 0.0

    while True:
        success, frame = cap.read()
        if not success:
            logger.error("Failed to grab frame from webcam.")
            break
            
        # 1. Resize frame to target display width (from config.py)
        h, w = frame.shape[:2]
        if w != config.DISPLAY_WIDTH:
            scale = config.DISPLAY_WIDTH / w
            new_h = int(h * scale)
            frame = cv2.resize(frame, (config.DISPLAY_WIDTH, new_h))
            
        # 2. Run detection (annotates landmarks and returns coordinates)
        result = detector.detect(frame)
        
        # 3. Classify and overlay gestures
        if result.has_hands:
            for i, (landmarks, handedness) in enumerate(zip(result.landmarks_list, result.handedness_list)):
                gesture = recognizer.classify(landmarks, handedness=handedness, hand_index=i)
                
                # Retrieve wrist landmark (Index 0) to position text near the hand
                h, w, _ = frame.shape
                wrist_x = int(landmarks[0].x * w)
                wrist_y = int(landmarks[0].y * h)
                
                # Display hand type and gesture label near wrist
                text_x = max(10, min(w - 250, wrist_x - 50))
                text_y = max(30, min(h - 15, wrist_y - 30))
                
                cv2.putText(
                    frame,
                    f"{handedness}: {gesture}",
                    (text_x, text_y),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    config.LABEL_FONT_SCALE,
                    config.LABEL_COLOR_BGR,
                    config.LABEL_FONT_THICKNESS
                )
            
            # Clear history for any hand slots no longer tracked
            for idx in range(result.hand_count, config.MAX_NUM_HANDS):
                if idx < len(recognizer._history):
                    recognizer._history[idx].clear()
        else:
            # Clear all history if no hands are visible
            recognizer.reset()
            
        # 4. Calculate and display FPS
        current_time = time.time()
        fps = 1.0 / (current_time - prev_time) if prev_time > 0 else 0.0
        prev_time = current_time
        
        cv2.putText(
            frame,
            f"FPS: {fps:.1f}",
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            config.FPS_COLOR_BGR,
            2
        )
        
        # 5. Display the window
        cv2.imshow("Neural Gesture Pipeline", frame)
        
        # 6. Handle key events
        key = cv2.waitKey(1) & 0xFF
        if key == ord(config.QUIT_KEY):
            break
        elif key == ord(config.SCREENSHOT_KEY):
            os.makedirs("screenshots", exist_ok=True)
            filename = f"screenshots/screenshot_{int(time.time())}.png"
            cv2.imwrite(filename, frame)
            logger.info(f"Saved screenshot to {filename}")
            
    cap.release()
    cv2.destroyAllWindows()
    detector.close()

if __name__ == "__main__":
    main()