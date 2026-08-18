import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

/**
 * Kirim file gambar ke backend untuk dideteksi.
 * @param {File} file
 * @returns {Promise<{image_width:number, image_height:number, detections:Array}>}
 */
export async function detectDimsum(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await client.post("/api/detect", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
}
