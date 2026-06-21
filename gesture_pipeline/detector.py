"""
detector.py — Hand Detection Module
=====================================
Wraps the MediaPipe Hands solution into a clean, reusable ``HandDetector``
class that handles initialisation, frame processing, and graceful teardown.

MediaPipe landmark indices (per hand):
    Wrist          : 0
    Thumb          : 1-4   (CMC → TIP)
    Index finger   : 5-8   (MCP → TIP)
    Middle finger  : 9-12  (MCP → TIP)
    Ring finger    : 13-16 (MCP → TIP)
    Pinky          : 17-20 (MCP → TIP)
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Optional

import cv2
import mediapipe as mp
import numpy as np

from . import config

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Typing aliases
# ---------------------------------------------------------------------------
LandmarkList = list  # mediapipe NormalizedLandmarkList


@dataclass
class DetectionResult:
    """Container for a single-frame hand detection result.

    Attributes:
        frame:          The annotated BGR frame (landmarks drawn on it).
        landmarks_list: One entry per detected hand — each entry is the raw
                        ``NormalizedLandmarkList`` from MediaPipe.
        handedness_list: Parallel list of handedness labels (``"Left"`` or
                        ``"Right"``) corresponding to ``landmarks_list``.
        hand_count:     Convenience count of detected hands (0, 1, or 2).
    """

    frame: np.ndarray
    landmarks_list: list = field(default_factory=list)
    handedness_list: list = field(default_factory=list)

    @property
    def hand_count(self) -> int:
        return len(self.landmarks_list)

    @property
    def has_hands(self) -> bool:
        return self.hand_count > 0


class HandDetector:
    """Real-time hand detector backed by MediaPipe Hands.

    Designed to be used as a context manager so MediaPipe resources are
    always released cleanly::

        with HandDetector() as detector:
            result = detector.detect(frame)

    It can also be used without the context manager — call ``close()``
    explicitly when done.

    Args:
        static_image_mode:      See :data:`config.STATIC_IMAGE_MODE`.
        max_num_hands:          See :data:`config.MAX_NUM_HANDS`.
        min_detection_confidence: See :data:`config.MIN_DETECTION_CONFIDENCE`.
        min_tracking_confidence: See :data:`config.MIN_TRACKING_CONFIDENCE`.
    """

    def __init__(
        self,
        static_image_mode: bool = config.STATIC_IMAGE_MODE,
        max_num_hands: int = config.MAX_NUM_HANDS,
        min_detection_confidence: float = config.MIN_DETECTION_CONFIDENCE,
        min_tracking_confidence: float = config.MIN_TRACKING_CONFIDENCE,
    ) -> None:
        self._mp_hands = mp.solutions.hands
        self._mp_draw = mp.solutions.drawing_utils
        self._mp_styles = mp.solutions.drawing_styles

        # Custom drawing specs for a more visually appealing overlay
        self._landmark_spec = self._mp_draw.DrawingSpec(
            color=config.LANDMARK_COLOR_BGR, thickness=2, circle_radius=4
        )
        self._connection_spec = self._mp_draw.DrawingSpec(
            color=config.CONNECTION_COLOR_BGR, thickness=2
        )

        self._hands = self._mp_hands.Hands(
            static_image_mode=static_image_mode,
            max_num_hands=max_num_hands,
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence,
        )
        logger.debug(
            "HandDetector initialised (max_hands=%d, det_conf=%.2f, track_conf=%.2f)",
            max_num_hands,
            min_detection_confidence,
            min_tracking_confidence,
        )

    # ------------------------------------------------------------------
    # Context manager support
    # ------------------------------------------------------------------

    def __enter__(self) -> "HandDetector":
        return self

    def __exit__(self, *_) -> None:
        self.close()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def detect(self, bgr_frame: np.ndarray) -> DetectionResult:
        """Process a single BGR video frame and return detection results.

        The returned ``DetectionResult.frame`` has landmark overlays already
        drawn so the caller only needs to display it.

        Args:
            bgr_frame: A single BGR image as a NumPy array (from ``cv2.VideoCapture``).

        Returns:
            A :class:`DetectionResult` containing the annotated frame and any
            detected hand landmarks / handedness labels.

        Raises:
            ValueError: If ``bgr_frame`` is ``None`` or empty.
        """
        if bgr_frame is None or bgr_frame.size == 0:
            raise ValueError("detect() received an empty or None frame.")

        # MediaPipe requires RGB input
        rgb_frame = cv2.cvtColor(bgr_frame, cv2.COLOR_BGR2RGB)

        # Mark non-writeable to pass by reference (performance optimisation)
        rgb_frame.flags.writeable = False
        mp_results = self._hands.process(rgb_frame)
        rgb_frame.flags.writeable = True

        landmarks_list: list = []
        handedness_list: list = []

        if mp_results.multi_hand_landmarks:
            for hand_landmarks, handedness in zip(
                mp_results.multi_hand_landmarks,
                mp_results.multi_handedness,
            ):
                # Draw skeleton overlay on the original BGR frame
                self._mp_draw.draw_landmarks(
                    bgr_frame,
                    hand_landmarks,
                    self._mp_hands.HAND_CONNECTIONS,
                    self._landmark_spec,
                    self._connection_spec,
                )
                landmarks_list.append(hand_landmarks.landmark)
                # MediaPipe reports 'Left'/'Right' from the camera's perspective
                handedness_list.append(handedness.classification[0].label)

        return DetectionResult(
            frame=bgr_frame,
            landmarks_list=landmarks_list,
            handedness_list=handedness_list,
        )

    def close(self) -> None:
        """Release MediaPipe resources. Called automatically in context manager."""
        if self._hands:
            self._hands.close()
            logger.debug("HandDetector closed — MediaPipe resources released.")


# ---------------------------------------------------------------------------
# Camera helper (not part of the detector class, but closely related)
# ---------------------------------------------------------------------------

def open_camera(index: int | str = config.CAMERA_INDEX) -> cv2.VideoCapture:
    """Open and validate a webcam capture device.

    Args:
        index: OpenCV device index (default 0) or video path/URL.

    Returns:
        An opened ``cv2.VideoCapture`` object.

    Raises:
        RuntimeError: If the camera cannot be opened after the configured
                      number of attempts.
    """
    cap = cv2.VideoCapture(index)

    if not cap.isOpened():
        raise RuntimeError(
            f"Could not open camera at index {index}. "
            "Ensure the camera is connected and not in use by another application."
        )

    logger.info("Camera opened on device index %d.", index)
    return cap
