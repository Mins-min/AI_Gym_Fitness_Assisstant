import cv2
import numpy as np

# Mock implementation for Python compatibility
MEDIAPIPE_AVAILABLE = False
print("Info: Running Workout Detector in lightweight mock mode for compatibility.")

def calculate_angle(a, b, c):
    """Calculates joint angles for posture correction and rep counting."""
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    
    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    
    if angle > 180.0:
        angle = 360 - angle
        
    return angle

def analyze_pose(frame_data=None):
    """API endpoint helper stub for processing frames."""
    return {
        "status": "success", 
        "message": "Pose analyzer running in compatibility mode", 
        "reps": 0,
        "form": "Good"
    }

def run_live_pose_detector():
    """Placeholder for live webcam pose tracking."""
    print("Live pose detector requires a compatible Python version (3.10 - 3.11). Mocking execution.")