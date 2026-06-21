"""
config.py — Centralized Configuration
======================================
All tunable runtime constants live here.  Edit this file to customize the
pipeline without touching any detection or recognition logic.
"""

# ---------------------------------------------------------------------------
# Camera / capture settings
# ---------------------------------------------------------------------------

#: OpenCV device index for the webcam (0 = default system camera) or video path/URL
CAMERA_INDEX: int | str = 0

#: Target display width in pixels. Height is scaled proportionally.
DISPLAY_WIDTH: int = 960

#: Maximum frames to wait for a camera to open before raising an error.
CAMERA_OPEN_TIMEOUT_FRAMES: int = 30

# ---------------------------------------------------------------------------
# MediaPipe Hands settings
# ---------------------------------------------------------------------------

#: When True, treats every frame as a static image (slower but more accurate).
#: Keep False for real-time video.
STATIC_IMAGE_MODE: bool = False

#: Maximum number of hands the detector will track simultaneously.
MAX_NUM_HANDS: int = 2

#: Minimum confidence [0, 1] required for the initial hand *detection* step.
MIN_DETECTION_CONFIDENCE: float = 0.75

#: Minimum confidence [0, 1] required to *track* a hand across frames.
MIN_TRACKING_CONFIDENCE: float = 0.65

# ---------------------------------------------------------------------------
# Gesture smoother
# ---------------------------------------------------------------------------

#: Number of recent frames used by the majority-vote gesture smoother.
#: Higher = more stable labels, lower = faster response.
SMOOTHING_WINDOW: int = 7

# ---------------------------------------------------------------------------
# Overlay / display settings
# ---------------------------------------------------------------------------

#: BGR color for the gesture label overlay text.
LABEL_COLOR_BGR: tuple[int, int, int] = (0, 255, 128)

#: BGR color for the FPS counter text.
FPS_COLOR_BGR: tuple[int, int, int] = (255, 255, 0)

#: Font scale for the gesture label.
LABEL_FONT_SCALE: float = 1.2

#: Font thickness for the gesture label.
LABEL_FONT_THICKNESS: int = 2

#: BGR color for the landmark skeleton.
LANDMARK_COLOR_BGR: tuple[int, int, int] = (0, 128, 255)

#: BGR color for the landmark connection lines.
CONNECTION_COLOR_BGR: tuple[int, int, int] = (255, 255, 255)

# ---------------------------------------------------------------------------
# Keyboard shortcuts
# ---------------------------------------------------------------------------

#: Press this key (as a character) to quit the application.
QUIT_KEY: str = "q"

#: Press this key to save a screenshot to ./screenshots/.
SCREENSHOT_KEY: str = "s"

