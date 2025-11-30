"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/app/firebase/firebase";
import ProjectCard from "@/components/ProjectCard";

export default function DevDashboard() {
  const [projects, setProjects] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Load user from cookie
  useEffect(() => {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user="));

    if (cookie) {
      const raw = cookie.split("user=")[1];
        const decoded = decodeURIComponent(raw);
        setCurrentUser(JSON.parse(decoded));    }
  }, []);

  // Load only assigned projects
  useEffect(() => {
    if (!currentUser) return;

    const unsub = onSnapshot(collection(db, "projects"), (snapshot) => {
      const allProjects = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      // Filter only assigned projects
      const filtered = allProjects.filter(
        (p: any) => p.assignedTo?.uid === currentUser.uid
      );

      setProjects(filtered);
    });

    return () => unsub();
  }, [currentUser]);

  if (!currentUser) return <p className="p-10 text-gray-600">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-10">
      <h1 className="text-3xl font-bold text-gray-900">Developer Dashboard</h1>
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Assigned Projects
        </h2>

        {projects.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 text-center">
            <p className="text-gray-600">No projects assigned yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map((p: any) => (
              <ProjectCard
                key={p.id}
                project={p}
                isAdmin={false} // Dev cannot assign
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
