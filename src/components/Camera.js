"use client";
import { useEffect, useRef, useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function Camera({ setImageUrl, handleCloseCamera, isCameraActive }) {
  const [image, setImage] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);


  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isCameraActive) {
      startCamera();
    }
  }, [isCameraActive]);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = stream;
      setCameraReady(true);

      videoRef.current.onloadedmetadata = () => {
        const { videoWidth, videoHeight } = videoRef.current;
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;
      };
    } catch (error) {
      if (error.name === 'OverconstrainedError') {
        console.warn('Constraints could not be satisfied. Retrying with default settings.');
        try {
          // Retry without any specific width/height or deviceId constraints
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
          videoRef.current.srcObject = fallbackStream;
          setCameraReady(true);
        } catch (fallbackError) {
          console.error('Error starting camera with fallback settings:', fallbackError);
        }
      } else {
        console.error('Error starting camera:', error);
      }
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Use video dimensions for canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Flip horizontally if needed (since video is mirrored)
    context.translate(canvas.width, 0);
    context.scale(-1, 1);

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Reset transform
    context.setTransform(1, 0, 0, 1, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setImage(dataUrl);
  };

  const uploadImage = async () => {
    if (!image) return;

    const blob = await (await fetch(image)).blob();
    const storage = getStorage();
    const storageRef = ref(storage, `images/${Date.now()}.jpg`);

    try {
      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setImageUrl(downloadURL);
      handleCloseCamera();
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const discardImage = () => {
    setImage(null);
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`flex flex-col fixed top-0 items-center justify-center w-screen h-screen z-50 bg-gray-950 ${cameraReady && !image ? 'block' : 'hidden'}`}>
        <video
          ref={videoRef}
          autoPlay
          className="max-h-[80vh] w-auto transform -scale-x-100 rounded-xl"
        ></video>
        <canvas ref={canvasRef} className="hidden transform -scale-x-100"></canvas>
        <div className="flex flex-center p-2 space-x-4 m-2 items-center">
          <button onClick={captureImage} className="mt-2 pl-14 fill-gray-500 active:fill-purple-500 w-max h-max rounded-3xl drop-shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="5rem" height="5rem" viewBox="0 0 24 24">
              <circle cx={12} cy={12} r={6} opacity={0.5}></circle>
              <path d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2m0 16a6 6 0 1 1 6-6a6.007 6.007 0 0 1-6 6"></path>
            </svg>
          </button>
          <button onClick={handleCloseCamera} className="mt-2 fill-gray-500 active:fill-purple-800 bg-gray-700 active:bg-purple-300 active:bg-opacity-50 drop-shadow-md w-max h-max rounded-3xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" viewBox="0 0 24 24" className="drop-shadow-md m-2">
              <path d="M7 18a1 1 0 0 1-.707-1.707l10-10a1 1 0 0 1 1.414 1.414l-10 10A1 1 0 0 1 7 18"></path>
              <path d="M17 18a1 1 0 0 1-.707-.293l-10-10a1 1 0 0 1 1.414-1.414l10 10A1 1 0 0 1 17 18"></path>
            </svg>
          </button>
        </div>
      </div>
      <div className={`flex flex-col fixed top-0 items-center justify-center w-screen h-screen z-50 bg-gray-950 ${image ? 'block' : 'hidden'}`}>
        <img
          src={image}
          alt="Captured"
          className="w-auto max-h-[80vh] object-contain rounded-xl"
        />
        <div className="flex items-center justify-center space-x-2 w-max">
          <button onClick={uploadImage} className="mt-2 bg-gray-700 text-white px-4 py-2 rounded-md w-full h-max">
            Upload
          </button>
          <button onClick={discardImage} className="mt-2 bg-gray-700 text-white px-4 py-2 rounded-md w-full h-max">
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}
