"use client";
import { useEffect, useRef, useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function Camera({ setImageUrl, handleCloseCamera, isCameraActive }) {
  const [image, setImage] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Start the camera if isCameraActive becomes true
  useEffect(() => {
    if (isCameraActive) {
      startCamera();
    }
  }, [isCameraActive]);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    setCameraReady(true);
  };

  const stopCamera = () => {
    setCameraReady(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
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

      // Reset local state
      handleCloseCamera();
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setImageUrl(null);
    }
  };

  const discardImage = () => {
    setImage(null);
    // Optional: restart camera or manage state as needed
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`flex flex-col fixed top-0 items-center justify-center w-screen h-screen z-50 bg-gray-950 ${cameraReady && !image ? 'block' : 'hidden'}`}>
        <video ref={videoRef} autoPlay className="m-4 transform -scale-x-100 rounded-xl"></video>
        <canvas ref={canvasRef} width={screen.width} height={screen.height} className="hidden"></canvas>
        <div className="flex flex-center p-2 space-x-4 m-2 items-center">
          <button className="mt-2 fill fill-gray-500 active:fill-purple-800 bg-gray-700 active:bg-purple-300 active:bg-opacity-50 drop-shadow-md w-max h-max rounded-3xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" viewBox="0 0 24 24" className="drop-shadow-md m-2">
              <circle cx={12} cy={12} r={3}></circle>
              <path d="M12 2a10.02 10.02 0 0 0-7 2.877V3a1 1 0 1 0-2 0v4.5a1 1 0 0 0 1 1h4.5a1 1 0 0 0 0-2H6.218A7.98 7.98 0 0 1 20 12a1 1 0 0 0 2 0A10.01 10.01 0 0 0 12 2m7.989 13.5h-4.5a1 1 0 0 0 0 2h2.293A7.98 7.98 0 0 1 4 12a1 1 0 0 0-2 0a9.986 9.986 0 0 0 16.989 7.133V21a1 1 0 0 0 2 0v-4.5a1 1 0 0 0-1-1" opacity={0.5}></path>
            </svg>
          </button>
          <button onClick={captureImage} className="mt-2 fill-gray-500 active:fill-purple-500 w-max h-max rounded-3xl drop-shadow-md">
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
      {image && (
        <div className="flex mt-4 space-x-4">
          <img src={image} alt="Captured" className="w-48 h-auto" />
          <div className="flex flex-col w-max">
            <button onClick={uploadImage} className="mt-2 bg-gray-700 text-white px-4 py-2 rounded-md w-full h-max">
              Upload
            </button>
            <button onClick={discardImage} className="mt-2 bg-gray-700 text-white px-4 py-2 rounded-md w-full h-max">
              Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
