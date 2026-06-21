"""
recognizer.py — Gesture Recognition Module
============================================
Classifies a MediaPipe ``NormalizedLandmarkList`` into named human gestures.

Supported gestures
------------------
+----------------+----------------------------+
| Gesture        | Hand state                 |
+================+============================+
| Fist           | All fingers curled         |
| Open Hand      | All 5 fingers extended     |
| Pointing       | Only index finger up       |
| Peace          | Index + middle fingers up  |
| Thumbs Up      | Only thumb extended (up)   |
| Thumbs Down    | Only thumb extended (down) |
| OK Sign        | Thumb + index form circle  |
| Rock On        | Index + pinky extended     |
| Call Me        | Thumb + pinky extended     |
+----------------+----------------------------+

Landmark index reference (MediaPipe 21-point hand model):
    Wrist        : 0
    Thumb  CMC/MCP/IP/TIP : 1  2  3  4
    Index  MCP/PIP/DIP/TIP: 5  6  7  8
    Middle MCP/PIP/DIP/TIP: 9 10 11 12
    Ring   MCP/PIP/DIP/TIP: 13 14 15 16
    Pinky  MCP/PIP/DIP/TIP: 17 18 19 20
"""

from __future__ import annotations

import logging
import math
from collections import deque
from typing import Optional

from . import config

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Landmark index constants  (improves readability inside detection methods)
# ---------------------------------------------------------------------------
WRIST = 0

THUMB_CMC, THUMB_MCP, THUMB_IP, THUMB_TIP = 1, 2, 3, 4

INDEX_MCP, INDEX_PIP, INDEX_DIP, INDEX_TIP = 5, 6, 7, 8
MIDDLE_MCP, MIDDLE_PIP, MIDDLE_DIP, MIDDLE_TIP = 9, 10, 11, 12
RING_MCP, RING_PIP, RING_DIP, RING_TIP = 13, 14, 15, 16
PINKY_MCP, PINKY_PIP, PINKY_DIP, PINKY_TIP = 17, 18, 19, 20

# Ordered list: [THUMB_TIP, INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP]
FINGER_TIPS = [THUMB_TIP, INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP]


class GestureRecognizer:
    """Stateful gesture classifier with optional temporal smoothing.

    The smoother keeps a rolling window of the last *N* frame predictions and
    returns the **majority vote** — this eliminates single-frame jitter caused
    by small hand movements or tracking noise.

    Args:
        smoothing_window: Number of frames to use in the majority-vote window.
                          Set to 1 to disable smoothing. See :data:`config.SMOOTHING_WINDOW`.

    Example::

        recognizer = GestureRecognizer()
        gesture = recognizer.classify(landmarks, handedness="Right")
        print(gesture)  # "Open Hand"
    """

    def __init__(self, smoothing_window: int = config.SMOOTHING_WINDOW) -> None:
        # One deque per tracked hand index (supports up to MAX_NUM_HANDS)
        self._history: list[deque] = [
            deque(maxlen=smoothing_window)
            for _ in range(config.MAX_NUM_HANDS)
        ]
        logger.debug("GestureRecognizer initialised (smoothing_window=%d).", smoothing_window)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def classify(
        self,
        landmarks,
        handedness: str = "Right",
        hand_index: int = 0,
    ) -> str:
        """Classify landmarks into a gesture name.

        Args:
            landmarks:   Raw ``NormalizedLandmarkList`` from MediaPipe (indexable).
            handedness:  ``"Left"`` or ``"Right"`` — used to correctly determine
                         thumb direction without hard-coding a camera orientation.
            hand_index:  Index of the hand (0 or 1) used for the smoother history.

        Returns:
            The name of the detected gesture as a human-readable string.
        """
        raw_gesture = self._classify_raw(landmarks, handedness)

        # Update smoother history for this hand slot
        if 0 <= hand_index < len(self._history):
            self._history[hand_index].append(raw_gesture)
            smoothed = self._majority_vote(self._history[hand_index])
        else:
            smoothed = raw_gesture

        return smoothed

    def reset(self) -> None:
        """Clear all smoothing history (useful when hands leave the frame)."""
        for dq in self._history:
            dq.clear()

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _classify_raw(self, landmarks, handedness: str) -> str:
        """Single-frame gesture classification — no temporal smoothing."""
        fingers = self._get_finger_states(landmarks, handedness)

        # Unpack for readability
        thumb, index, middle, ring, pinky = fingers
        total_up = sum(fingers)

        # --- Priority-ordered gesture rules ---

        if total_up == 0:
            return "Fist ✊"

        if total_up == 5:
            return "Open Hand 🖐"

        # Thumbs Up / Down — only thumb extended, determined by wrist-relative y
        if fingers == [1, 0, 0, 0, 0]:
            thumb_tip_y = landmarks[THUMB_TIP].y
            wrist_y = landmarks[WRIST].y
            if thumb_tip_y < wrist_y - 0.05:
                return "Thumbs Up 👍"
            elif thumb_tip_y > wrist_y + 0.05:
                return "Thumbs Down 👎"
            return "Thumbs Up 👍"

        # Pointing — only index finger extended
        if fingers == [0, 1, 0, 0, 0]:
            return "Pointing ☝"

        # Peace / Victory — index + middle only
        if fingers == [0, 1, 1, 0, 0]:
            return "Peace ✌"

        # OK Sign — check if thumb tip and index tip are very close, and other fingers are extended
        if middle and ring and pinky:
            if self._distance(landmarks[THUMB_TIP], landmarks[INDEX_TIP]) < 0.07:
                return "OK Sign 👌"

        # Rock On — index + pinky extended
        if fingers == [0, 1, 0, 0, 1]:
            return "Rock On 🤘"

        # Call Me — thumb + pinky extended
        if fingers == [1, 0, 0, 0, 1]:
            return "Call Me 🤙"

        # Middle finger only — included for completeness / accuracy
        if fingers == [0, 0, 1, 0, 0]:
            return "Middle Finger"

        # Fallback — report count
        return f"{total_up} Fingers"

    def _get_finger_states(self, landmarks, handedness: str) -> list[int]:
        """Return a 5-element list (thumb→pinky) where 1 = extended, 0 = curled.

        Thumb uses the x-axis because it moves laterally; the direction is
        flipped for left hands to avoid mirroring errors.

        For fingers 2–5, a finger is considered extended when its TIP y-
        coordinate is above (smaller y value) its PIP joint — this is more
        robust than comparing to MCP because PIP is closer to the knuckle.
        """
        fingers: list[int] = []

        # --- Thumb ---
        # For a right hand (camera-mirrored), thumb tip should be to the LEFT
        # of thumb IP to be extended. For a left hand, the direction is reversed.
        thumb_tip_x = landmarks[THUMB_TIP].x
        thumb_ip_x = landmarks[THUMB_IP].x

        if handedness == "Right":
            fingers.append(1 if thumb_tip_x < thumb_ip_x else 0)
        else:  # Left hand
            fingers.append(1 if thumb_tip_x > thumb_ip_x else 0)

        # --- Index, Middle, Ring, Pinky ---
        # Each finger's TIP is compared to its PIP (second-to-last joint).
        for tip_id in [INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP]:
            pip_id = tip_id - 2  # TIP - 2 = PIP for all four fingers
            fingers.append(1 if landmarks[tip_id].y < landmarks[pip_id].y else 0)

        return fingers

    @staticmethod
    def _distance(lm_a, lm_b) -> float:
        """Euclidean distance between two normalised landmarks (x, y only)."""
        return math.hypot(lm_a.x - lm_b.x, lm_a.y - lm_b.y)

    @staticmethod
    def _majority_vote(history: deque) -> str:
        """Return the most frequent gesture in the history window."""
        if not history:
            return "Unknown"
        return max(set(history), key=history.count)
