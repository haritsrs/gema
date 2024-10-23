// components/Camera.js
"use client";
import { useRef, useState } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function Camera({ setImageUrl }) { // Pass setImageUrl as a prop
  const [image, setImage] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    setCameraReady(true);
  };

  function stopCamera (){
    setCameraReady(false);
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setImage(dataUrl);
  };

  const uploadImage = async () => {
    if (!image) return; // Ensure image is defined

    const blob = await (await fetch(image)).blob(); // Convert dataUrl to Blob
    const storage = getStorage();
    const storageRef = ref(storage, `images/${Date.now()}.jpg`);

    try {
      const snapshot = await uploadBytes(storageRef, blob); // Upload the Blob
      const downloadURL = await getDownloadURL(snapshot.ref); // Get the download URL
      console.log('Uploaded a blob or file!', snapshot);
      
      // Pass the uploaded image URL back to the parent component
      setImageUrl(downloadURL); // Set the URL in the parent component
      setImage(null); // Clear the local image state after upload
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  function discardImage(){
      setImage(null);
  };

  return (
    <div className="flex flex-col items-center">
      {!cameraReady && (
        <button onClick={startCamera} className="mt-2 bg-gray-700 active:bg-purple-300 active:bg-opacity-50 fill-gray-500 active:fill-purple-500 rounded-lg drop-shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24" className="drop-shadow-md m-1">
            <path d="M14.793 3c.346 0 .682.12.95.34l.11.1L17.415 5H20a2 2 0 0 1 1.995 1.85L22 7v12a2 2 0 0 1-1.85 1.995L20 21H4a2 2 0 0 1-1.995-1.85L2 19V7a2 2 0 0 1 1.85-1.995L4 5h2.586l1.56-1.56c.245-.246.568-.399.913-.433L9.207 3z" className="duoicon-secondary-layer" opacity={0.5}>
            </path>
            <path d="M12 7.5c-3.849 0-6.255 4.167-4.33 7.5A5 5 0 0 0 12 17.5c3.849 0 6.255-4.167 4.33-7.5A5 5 0 0 0 12 7.5" className="duoicon-primary-layer">
            </path>
          </svg>
        </button>
      )}
      <div className={`flex flex-col fixed top-0 items-center justify-center w-screen h-screen z-50 bg-gray-950 ${cameraReady && !image ? 'block' : 'hidden'}`}>
        <video ref={videoRef} autoPlay className="m-4 transform -scale-x-100 rounded-xl"></video>
        <canvas ref={canvasRef} className="hidden"></canvas>
        <div className="flex flex-center p-2 space-x-4 m-2 items-center">
          <button className="mt-2 fill fill-gray-500 active:fill-purple-800 bg-gray-700 active:bg-purple-300 active:bg-opacity-50 drop-shadow-md w-max h-max rounded-3xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" viewBox="0 0 24 24" className="drop-shadow-md m-2">
              <circle cx={12} cy={12} r={3}>
              </circle>
              <path d="M12 2a10.02 10.02 0 0 0-7 2.877V3a1 1 0 1 0-2 0v4.5a1 1 0 0 0 1 1h4.5a1 1 0 0 0 0-2H6.218A7.98 7.98 0 0 1 20 12a1 1 0 0 0 2 0A10.01 10.01 0 0 0 12 2m7.989 13.5h-4.5a1 1 0 0 0 0 2h2.293A7.98 7.98 0 0 1 4 12a1 1 0 0 0-2 0a9.986 9.986 0 0 0 16.989 7.133V21a1 1 0 0 0 2 0v-4.5a1 1 0 0 0-1-1" opacity={0.5}>
              </path>
            </svg>
          </button>
          <button onClick={captureImage} className="mt-2 fill-gray-500 active:fill-purple-500 w-max h-max rounded-3xl drop-shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="5rem" height="5rem" viewBox="0 0 24 24">
              <circle cx={12} cy={12} r={6} opacity={0.5}>
              </circle>
              <path d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2m0 16a6 6 0 1 1 6-6a6.007 6.007 0 0 1-6 6">
              </path>
            </svg>
          </button>
          <button onClick={stopCamera} className="mt-2 fill-gray-500 active:fill-purple-800 bg-gray-700 active:bg-purple-300 active:bg-opacity-50 drop-shadow-md w-max h-max rounded-3xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="2rem" height="2rem" viewBox="0 0 24 24" className="drop-shadow-md m-2">
              <path d="M7 18a1 1 0 0 1-.707-1.707l10-10a1 1 0 0 1 1.414 1.414l-10 10A1 1 0 0 1 7 18">
              </path>
              <path d="M17 18a1 1 0 0 1-.707-.293l-10-10a1 1 0 0 1 1.414-1.414l10 10A1 1 0 0 1 17 18">
              </path>
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
