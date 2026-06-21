export interface Landmark {
  x: number;
  y: number;
  z: number;
}

// MediaPipe Landmark Index Constants
const WRIST = 0;
const THUMB_IP = 3;
const THUMB_TIP = 4;
const INDEX_PIP = 6;
const INDEX_TIP = 8;
const MIDDLE_PIP = 10;
const MIDDLE_TIP = 12;
const RING_PIP = 14;
const RING_TIP = 16;
const PINKY_PIP = 18;
const PINKY_TIP = 20;

function calculateDistance(lmA: Landmark, lmB: Landmark): number {
  return Math.hypot(lmA.x - lmB.x, lmA.y - lmB.y);
}

export function classifyGesture(landmarks: Landmark[], handedness: 'Left' | 'Right'): {
  gesture: string;
  fingerCount: number;
  fingerStates: number[];
} {
  if (landmarks.length < 21) {
    return { gesture: 'Unknown', fingerCount: 0, fingerStates: [0, 0, 0, 0, 0] };
  }

  const fingers = [0, 0, 0, 0, 0]; // [thumb, index, middle, ring, pinky]

  // 1. Thumb State
  // For a camera-mirrored right hand, the thumb tip should be to the left of IP
  const thumbTipX = landmarks[THUMB_TIP].x;
  const thumbIpX = landmarks[THUMB_IP].x;
  if (handedness === 'Right') {
    fingers[0] = thumbTipX < thumbIpX ? 1 : 0;
  } else {
    fingers[0] = thumbTipX > thumbIpX ? 1 : 0;
  }

  // 2. Index Finger State
  fingers[1] = landmarks[INDEX_TIP].y < landmarks[INDEX_PIP].y ? 1 : 0;

  // 3. Middle Finger State
  fingers[2] = landmarks[MIDDLE_TIP].y < landmarks[MIDDLE_PIP].y ? 1 : 0;

  // 4. Ring Finger State
  fingers[3] = landmarks[RING_TIP].y < landmarks[RING_PIP].y ? 1 : 0;

  // 5. Pinky Finger State
  fingers[4] = landmarks[PINKY_TIP].y < landmarks[PINKY_PIP].y ? 1 : 0;

  const totalUp = fingers.reduce((a, b) => a + b, 0);

  // Match Gestures
  let gesture = `${totalUp} Fingers`;

  const thumb = fingers[0];
  const index = fingers[1];
  const middle = fingers[2];
  const ring = fingers[3];
  const pinky = fingers[4];

  // Fist
  if (totalUp === 0) {
    gesture = 'Fist ✊';
  }
  // Open Hand
  else if (totalUp === 5) {
    gesture = 'Open Hand 🖐';
  }
  // Thumbs Up / Down
  else if (thumb === 1 && index === 0 && middle === 0 && ring === 0 && pinky === 0) {
    const thumbTipY = landmarks[THUMB_TIP].y;
    const wristY = landmarks[WRIST].y;
    if (thumbTipY < wristY - 0.05) {
      gesture = 'Thumbs Up 👍';
    } else if (thumbTipY > wristY + 0.05) {
      gesture = 'Thumbs Down 👎';
    } else {
      gesture = 'Thumbs Up 👍';
    }
  }
  // Pointing
  else if (thumb === 0 && index === 1 && middle === 0 && ring === 0 && pinky === 0) {
    gesture = 'Pointing ☝';
  }
  // Peace / Victory
  else if (thumb === 0 && index === 1 && middle === 1 && ring === 0 && pinky === 0) {
    gesture = 'Peace ✌';
  }
  // OK Sign (index tip close to thumb tip, others extended)
  else if (middle === 1 && ring === 1 && pinky === 1) {
    if (calculateDistance(landmarks[THUMB_TIP], landmarks[INDEX_TIP]) < 0.07) {
      gesture = 'OK Sign 👌';
    }
  }
  // Rock On
  else if (thumb === 0 && index === 1 && middle === 0 && ring === 0 && pinky === 1) {
    gesture = 'Rock On 🤘';
  }
  // Call Me
  else if (thumb === 1 && index === 0 && middle === 0 && ring === 0 && pinky === 1) {
    gesture = 'Call Me 🤙';
  }
  // Middle Finger
  else if (thumb === 0 && index === 0 && middle === 1 && ring === 0 && pinky === 0) {
    gesture = 'Middle Finger 🖕';
  }

  return {
    gesture,
    fingerCount: totalUp,
    fingerStates: fingers
  };
}
