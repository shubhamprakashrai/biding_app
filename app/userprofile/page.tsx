"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase/firebase";
import { auth } from "@/app/firebase/firebase";

interface UserData {
  uid: string;
  email: string;
  role: "USER" | "ADMIN";
  name: string;
  photoURL?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUser(docSnap.data() as UserData);
          localStorage.setItem("user", JSON.stringify(docSnap.data())); // sync
        } else {
          const localUser = localStorage.getItem("user");
          if (localUser) setUser(JSON.parse(localUser));
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <p className="p-6">Loading profile...</p>;
  if (!user) return <p className="p-6 text-gray-500">No user data found. Please login.</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      <div className="bg-white shadow rounded-xl p-6 space-y-3">
        <div className="flex items-center space-x-4">
          <img
            src={user.photoURL || "https://via.placeholder.com/80"}
            alt={user.name}
            className="w-16 h-16 rounded-full border"
          />
          <div>
            <p className="text-lg font-semibold">{user.name}</p>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>
        <p><span className="font-medium">Role:</span> {user.role}</p>
      </div>
    </div>
  );
}
