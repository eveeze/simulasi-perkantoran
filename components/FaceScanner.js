'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export default function FaceScanner({
  onFaceDetected,
  onDescriptorCaptured,
  mode = 'verify',
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [status, setStatus] = useState('Memuat model AI...');
  const [faceapi, setFaceapi] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    loadModels();
    return () => {
      stopCamera();
    };
  }, []);

  async function loadModels() {
    try {
      const faceapiModule = await import('face-api.js');
      setFaceapi(faceapiModule);

      const MODEL_URL = '/models';

      await Promise.all([
        faceapiModule.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapiModule.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapiModule.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      setModelsLoaded(true);
      setStatus('Model siap. Klik untuk mengaktifkan kamera.');
    } catch (err) {
      console.error('Model loading error:', err);
      setStatus(
        'Gagal memuat model. Pastikan file model ada di /public/models/',
      );
    }
  }

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        setStatus('Mendeteksi wajah...');
        startDetection();
      }
    } catch (err) {
      console.error('Camera error:', err);
      setStatus('Gagal mengakses kamera. Periksa izin browser.');
    }
  }

  function stopCamera() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }

  function startDetection() {
    if (!faceapi || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const displaySize = {
      width: video.videoWidth || 640,
      height: video.videoHeight || 480,
    };
    faceapi.matchDimensions(canvas, displaySize);

    intervalRef.current = setInterval(async () => {
      try {
        const detections = await faceapi
          .detectAllFaces(
            video,
            new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }),
          )
          .withFaceLandmarks()
          .withFaceDescriptors();

        const resized = faceapi.resizeResults(detections, displaySize);

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw custom bounding boxes
        resized.forEach((det) => {
          const box = det.detection.box;
          ctx.strokeStyle = '#e4ff1a';
          ctx.lineWidth = 2;
          ctx.strokeRect(box.x, box.y, box.width, box.height);

          // Corner accents
          const cornerLen = 15;
          ctx.lineWidth = 3;
          // top-left
          ctx.beginPath();
          ctx.moveTo(box.x, box.y + cornerLen);
          ctx.lineTo(box.x, box.y);
          ctx.lineTo(box.x + cornerLen, box.y);
          ctx.stroke();
          // top-right
          ctx.beginPath();
          ctx.moveTo(box.x + box.width - cornerLen, box.y);
          ctx.lineTo(box.x + box.width, box.y);
          ctx.lineTo(box.x + box.width, box.y + cornerLen);
          ctx.stroke();
          // bottom-left
          ctx.beginPath();
          ctx.moveTo(box.x, box.y + box.height - cornerLen);
          ctx.lineTo(box.x, box.y + box.height);
          ctx.lineTo(box.x + cornerLen, box.y + box.height);
          ctx.stroke();
          // bottom-right
          ctx.beginPath();
          ctx.moveTo(box.x + box.width - cornerLen, box.y + box.height);
          ctx.lineTo(box.x + box.width, box.y + box.height);
          ctx.lineTo(box.x + box.width, box.y + box.height - cornerLen);
          ctx.stroke();
        });

        if (detections.length > 0) {
          setStatus(`Wajah terdeteksi (${detections.length})`);
          if (onFaceDetected) onFaceDetected(detections);
        } else {
          setStatus('Mendeteksi wajah...');
        }
      } catch (err) {
        // silent fail on detection cycle
      }
    }, 300);
  }

  async function captureDescriptor() {
    if (!faceapi || !videoRef.current) return null;

    setStatus('Mengambil deskriptor wajah...');

    try {
      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }),
        )
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setStatus('Tidak ada wajah terdeteksi. Coba lagi.');
        return null;
      }

      const descriptor = Array.from(detection.descriptor);
      setStatus('Deskriptor wajah berhasil diambil!');

      if (onDescriptorCaptured) {
        onDescriptorCaptured(descriptor);
      }

      return descriptor;
    } catch (err) {
      console.error('Capture descriptor error:', err);
      setStatus('Gagal mengambil deskriptor. Coba lagi.');
      return null;
    }
  }

  return (
    <div>
      {/* Scanner */}
      <div
        className={`face-scanner-container ${cameraActive ? 'scanner-pulse' : ''}`}
        style={{ margin: '0 auto', background: 'var(--color-surface)' }}
      >
        <video
          ref={videoRef}
          style={{ display: cameraActive ? 'block' : 'none' }}
          playsInline
          muted
        />
        <canvas ref={canvasRef} />

        {!cameraActive && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-text-muted)"
              strokeWidth="1"
            >
              <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span
              className="text-mono"
              style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}
            >
              Face ID Scanner
            </span>
          </div>
        )}
      </div>

      {/* Status */}
      <div
        style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <span
          className="text-mono"
          style={{
            fontSize: '0.75rem',
            color: modelsLoaded
              ? 'var(--color-accent)'
              : 'var(--color-text-muted)',
          }}
        >
          {status}
        </span>
      </div>

      {/* Controls */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        {!cameraActive ? (
          <button
            className="btn btn-primary"
            onClick={startCamera}
            disabled={!modelsLoaded}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Aktifkan Kamera
          </button>
        ) : (
          <>
            <button className="btn btn-primary" onClick={captureDescriptor}>
              {mode === 'register' ? 'Daftarkan Wajah' : 'Verifikasi Wajah'}
            </button>
            <button className="btn btn-secondary" onClick={stopCamera}>
              Matikan Kamera
            </button>
          </>
        )}
      </div>
    </div>
  );
}
