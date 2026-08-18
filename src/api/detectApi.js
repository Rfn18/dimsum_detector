import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Sends the given image file to the detection backend and returns the
 * detection result. Contract preserved from the original implementation:
 *
 * {
 *   detections: [{ class_name, confidence, bbox: [x1, y1, x2, y2] }],
 *   image_width: number,
 *   image_height: number,
 * }
 */
export async function detectDimsum(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(`${API_BASE_URL}/api/detect`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
}
