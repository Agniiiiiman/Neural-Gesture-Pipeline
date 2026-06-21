"""
Neural Gesture Pipeline
=======================
A real-time hand gesture recognition system built with OpenCV and MediaPipe.

Modules:
    - detector   : HandDetector — wraps MediaPipe Hands lifecycle
    - recognizer : GestureRecognizer — classifies landmarks into named gestures
    - config     : Centralised configuration constants
"""

__version__ = "1.0.0"
__author__ = "Neural Gesture Pipeline Contributors"

from .detector import HandDetector, open_camera
from .recognizer import GestureRecognizer
from . import config

__all__ = ["HandDetector", "open_camera", "GestureRecognizer", "config"]

