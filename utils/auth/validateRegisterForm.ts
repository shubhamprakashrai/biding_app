import { RegisterFormData } from "@/types/RegisterFormTypes";

export function validateRegisterForm(data: RegisterFormData) {
  const errors: Record<string, string> = {};

  if (!data.name.trim()) errors.name = "Name is required";

  if (!data.email) errors.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(data.email))
    errors.email = "Email is invalid";

  if (!data.password) errors.password = "Password is required";

  if (data.password !== data.confirmPassword)
    errors.confirmPassword = "Passwords do not match";

  return errors;
}
