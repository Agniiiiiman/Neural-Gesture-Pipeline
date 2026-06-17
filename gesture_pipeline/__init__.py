"""
Neural Gesture Pipeline
=======================
A real-time hand gesture recognition system built with OpenCV and MediaPipe.

Modules:
    - detector   : HandDetector — wraps MediaPipe Hands lifecycle
    - recognizer : GestureRecognizer — classifies landmarks into named gestures
    - utils      : Drawing helpers, FPS counter, frame utilities
    - config     : Centralised configuration constants
"""

__version__ = "1.0.0"
__author__ = "Neural Gesture Pipeline Contributors"

from gesture_pipeline.detector import HandDetector
from gesture_pipeline.recognizer import GestureRecognizer

__all__ = ["HandDetector", "GestureRecognizer"]
