"use client";
// menggunakan client side

// import statement
import { useState, useEffect } from 'react';
import { getAuth, updateProfile, updateEmail, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref as databaseRef, update, get } from "firebase/database";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth } from '../../../firebase';
import Image from 'next/image';

// fungsi halaman profil
export default function ProfilePage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    username: '',
    displayName: '',
    profilePicture: '',
    email: '',
    birthday: '',
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const storage = getStorage();
  const database = getDatabase();

  // fungsi autentikasi
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // fungsi memuat data pengguna
  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (!currentUser) {
          return;
        }

        const userRef = databaseRef(database, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);
        const dbData = snapshot.exists() ? snapshot.val() : {};

        // mencampurkan data pengguna dari Auth dan Realtime Database
        setUserData({
          username: currentUser.displayName || '',
          displayName: currentUser.displayName || '',
          profilePicture: currentUser.photoURL || '',
          email: currentUser.email || '',
          birthday: dbData.birthday || '',
        });

        // menampilkan foto profil pengguna
        if (currentUser.photoURL) {
          setImageUrl(currentUser.photoURL);
        }

      } catch (error) {
        console.error("Error loading user data:", error);
        setError("Failed to load user data");
      }
    };

    loadUserData();
  }, [currentUser, database]);

  // fungsi mengubah gambar profil
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setSelectedImage(file);
        const imageRef = storageRef(storage, `profile-pictures/${currentUser.uid}`);
        await uploadBytes(imageRef, file);
        const downloadURL = await getDownloadURL(imageRef);
        setImageUrl(downloadURL);
        setUserData(prev => ({ ...prev, profilePicture: downloadURL }));
      } catch (error) {
        console.error("Error uploading image:", error);
        setError("Failed to upload image");
      }
    }
  };

  // fungsi mengubah data pengguna
  const handleInputChange = (e) => {
    setUserData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // fungsi menyimpan perubahan profil
  const handleUpdateProfile = async () => {
    const { displayName, email, birthday, profilePicture } = userData;

    if (!currentUser) {
      setError("No user logged in");
      return;
    }

    try {
      setLoading(true);
      
      await updateProfile(currentUser, { 
        displayName, 
        photoURL: profilePicture 
      });

      // hanya update email jika beurbah
      if (email !== currentUser.email) {
        await updateEmail(currentUser, email);
      }

      // update data pengguna di Realtime Database
      const userRef = databaseRef(database, `users/${currentUser.uid}`);
      await update(userRef, {
        displayName,
        birthday,
        profilePicture,
        email
      });

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // menampilkan pesan loading
  if (loading) {
    return <div className="text-center p-6">Memuat...</div>;
  }

  // menampilkan pesan jika pengguna belum masuk
  if (!currentUser) {
    return <div className="text-center p-6">Silakan masuk untuk melihat profil Anda.</div>;
  }

  // JSX halaman profil
  return (
    <div className="">
      <h2 className="text-2xl font-bold mb-4 text-white">Sunting Profil</h2>
  
      <div className="space-y-4">
        <div>
          <label className="block mb-2 text-gray-400">Nama Pengguna</label>
          <input
            type="text"
            name="username"
            value={userData.username}
            onChange={handleInputChange}
            className="p-3 border-2 border-gray-700 rounded w-full bg-gray-800 text-white focus:outline-none focus:border-purple-500"
          />
        </div>
  
        <div>
          <label className="block mb-2 text-gray-400">Nama Tampil</label>
          <input
            type="text"
            name="displayName"
            value={userData.displayName}
            onChange={handleInputChange}
            className="p-3 border-2 border-gray-700 rounded w-full bg-gray-800 text-white focus:outline-none focus:border-purple-500"
          />
        </div>
  
        <div>
          <label className="block mb-2 text-gray-400">Email</label>
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleInputChange}
            className="p-3 border-2 border-gray-700 rounded w-full bg-gray-800 text-white focus:outline-none focus:border-purple-500"
          />
        </div>
  
        <div>
          <label className="block mb-2 text-gray-400">Ulang Tahun</label>
          <input
            type="date"
            name="birthday"
            value={userData.birthday}
            onChange={handleInputChange}
            className="p-3 border-2 border-gray-700 rounded w-full bg-gray-800 text-white focus:outline-none focus:border-purple-500"
          />
        </div>
  
        <div>
          <label className="block mb-2 text-gray-400">Foto Profil</label>
          <div className="flex items-center">
            <label
              htmlFor="profile-picture"
              className="px-4 py-2 bg-gray-800 text-gray-400 rounded cursor-pointer hover:bg-gray-700"
            >
              Choose File
            </label>
            <input
              id="profile-picture"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Profile Picture"
                width={100}
                height={100}
                className="rounded-full ml-4"
              />
            ) : userData.profilePicture ? (
              <Image
                src={userData.profilePicture}
                alt="Current Profile Picture"
                width={100}
                height={100}
                className="rounded-full ml-4"
              />
            ) : (
              <p className="ml-4 text-gray-500">Tidak ada foto profil yang ditampilkan</p>
            )}
          </div>
        </div>
  
        <button
          onClick={handleUpdateProfile}
          disabled={loading}
          className="w-full py-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
  
        {error && (
          <p className="text-red-500 mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}