import { userRepository } from "@/services/firebase/UserRepository";
import { User } from "@/types";

export async function fetchAllUsers(): Promise<User[]> {
  try {
    const users = await userRepository.getAllUsers();

    return users.map(user => ({
      id: user.uid,
      name: user.name,
      email: user.email,
      role: user.role,
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}
