const BASE_URL = "http://localhost:8080";

export const signup = async (data: {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phoneNumber: string;
}) => {
  const res = await fetch(`${BASE_URL}/user/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Signup failed");
  }

  return res.json();
};