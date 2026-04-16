const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  targetRole?: string;
  location?: string;
  education?: string;
  createdAt?: string;
  updatedAt?: string;
};

type SignupResponse = {
  message: string;
};

type LoginResponse = {
  message: string;
  token: string;
  user: AuthUser;
};

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data as T;
}

export async function signupRequest(data: {
  name: string;
  email: string;
  password: string;
}): Promise<SignupResponse> {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<SignupResponse>(res);
}

export async function loginRequest(data: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<LoginResponse>(res);
}

export async function getMeRequest(token: string): Promise<AuthUser> {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse<AuthUser>(res);
}