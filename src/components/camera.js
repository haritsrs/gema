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

  return (
    <div className="flex flex-col items-center">
      {!cameraReady && (
        <button onClick={startCamera} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
          Open Camera
        </button>
      )}
      <video ref={videoRef} autoPlay className={`mt-2 ${cameraReady ? 'block' : 'hidden'}`}></video>
      <canvas ref={canvasRef} className="hidden"></canvas>
      <button onClick={captureImage} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded" disabled={!cameraReady}>
        Capture Photo
      </button>
      {image && (
        <div className="mt-4">
          <img src={image} alt="Captured" className="w-48 h-auto" />
          <button onClick={uploadImage} className="mt-2 bg-green-500 text-white px-4 py-2 rounded">Upload</button>
        </div>
      )}
    </div>
  );
}
