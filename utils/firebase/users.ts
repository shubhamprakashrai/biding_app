import { db } from "@/app/firebase/firebase";
import { collection, getDocs, DocumentData } from "firebase/firestore";
import { User } from "@/types";

export async function fetchAllUsers(): Promise<User[]> {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    const users: User[] = snapshot.docs.map((doc: DocumentData) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}
