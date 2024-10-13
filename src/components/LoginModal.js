// components/LoginModal.js
import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose(); // Close the modal after successful login
    } catch (error) {
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white p-6 rounded">
        <h2 className="text-lg font-bold mb-4">Sign In</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full mb-2 p-2 border rounded"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full mb-2 p-2 border rounded"
        />
        <button onClick={handleEmailLogin} className="w-full bg-blue-600 p-2 rounded">Sign In</button>
        <button onClick={onClose} className="w-full mt-2 bg-red-600 p-2 rounded">Close</button>
      </div>
    </div>
  );
}
