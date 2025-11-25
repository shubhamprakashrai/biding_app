"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/firebase/firebase";
import { collection, getDocs, DocumentData, doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { User, UserRole } from "@/types";
import { showSuccessToast, showErrorToast } from "@/utils/auth/authToast";

export default function ListUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);

    // Protect route for Admin only
    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            const currentUser: User = JSON.parse(userData);
            if (!currentUser || currentUser.role !== "ADMIN") {
                router.push("/not-authorized");
            }
        }
    }, [router]);

    // Fetch users from Firestore
    useEffect(() => {
        async function fetchUsers() {
            try {
                setLoading(true);
                const usersRef = collection(db, "users");
                const snapshot = await getDocs(usersRef);

                const usersList: User[] = snapshot.docs.map((doc: DocumentData) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setUsers(usersList);
            } catch (error) {
                console.error("Error fetching users:", error);
            }finally {
            setLoading(false);
        }
        }

        fetchUsers();
    }, []);

    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, { role: newRole });

            // Update UI instantly
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === userId ? { ...u, role: newRole } : u
                )
            );
            showSuccessToast(`Role updated to ${newRole} successfully`);
            console.log(`Role updated for ${userId}: ${newRole}`);
        } catch (error) {
            console.error("Error updating role:", error);
            showErrorToast("Failed to update role. Try again.");

        }
    };

    return (
       <div className="p-6">
    <h1 className="text-xl font-semibold mb-4">All Users</h1>

    {/* Loading State */}
    {loading && (
        <p className="text-gray-500 text-sm">Loading users...</p>
    )}

    {/* No Users Found */}
    {!loading && users.length === 0 && (
        <p className="text-gray-500 text-sm">No users present.</p>
    )}

    {/* Users List */}
    {!loading && users.length > 0 && (
        <div className="space-y-3">
            {users.map((user) => (
                <div
                    key={user.id}
                    className="p-4 border rounded-lg shadow bg-white flex items-center justify-between"
                >
                    {/* User Info */}
                    <div>
                        <p className="font-bold">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                    </div>

                    {/* Role Dropdown */}
                    <select
                        value={user.role}
                        onChange={(e) =>
                            handleRoleChange(user.id, e.target.value as UserRole)
                        }
                        className="border rounded-lg p-2 text-sm bg-gray-50"
                    >
                        <option value="ADMIN">Admin</option>
                        <option value="USER">User</option>
                        <option value="DEV">Developer</option>
                    </select>
                </div>
            ))}
        </div>
    )}
</div>

    );
}
