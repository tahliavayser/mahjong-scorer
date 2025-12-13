import { useState, useRef } from 'react';
import './ImageCapture.css';

const ImageCapture = ({ onImageCapture }) => {
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCamera, setIsCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      setStream(mediaStream);
      setIsCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check permissions or use file upload instead.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        setCapturedImage(url);
        stopCamera();
        onImageCapture(blob, url);
      }, 'image/jpeg', 0.95);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setCapturedImage(url);
      onImageCapture(file, url);
    }
  };

  const resetCapture = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
    setCapturedImage(null);
    stopCamera();
  };

  return (
    <div className="image-capture">
      <h2>Capture Your Mahjong Hand</h2>
      <p className="capture-description">
        Take a photo of your winning 14 tiles only. You'll provide additional context like flowers, seasons, and seat position after capture.
      </p>
      
      {!capturedImage && !isCamera && (
        <div className="capture-options">
          <button className="btn btn-primary" onClick={startCamera}>
            📷 Use Camera
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => fileInputRef.current?.click()}
          >
            📁 Upload Photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      )}

      {isCamera && (
        <div className="camera-view">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="video-preview"
          />
          <div className="camera-controls">
            <button className="btn btn-primary" onClick={capturePhoto}>
              📸 Capture
            </button>
            <button className="btn btn-secondary" onClick={stopCamera}>
              ✕ Cancel
            </button>
          </div>
        </div>
      )}

      {capturedImage && (
        <div className="image-preview">
          <img src={capturedImage} alt="Captured mahjong hand" />
          <div className="preview-controls">
            <button className="btn btn-secondary" onClick={resetCapture}>
              🔄 Retake
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCapture;
