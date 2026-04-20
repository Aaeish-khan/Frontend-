const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  targetRole?: string;
  location?: string;
  education?: string;
  username?: string;
  headline?: string;
  website?: string;
  bio?: string;
  accountStatus?: "active" | "deactivated";
  createdAt?: string;
  updatedAt?: string;
};

export type AccountSettings = {
  profile: {
    fullName: string;
    username: string;
    headline: string;
    location: string;
    website: string;
    bio: string;
    education: string;
  };
  notifications: {
    mentions: boolean;
    weeklyDigest: boolean;
    productUpdates: boolean;
    securityAlerts: boolean;
    interviewReminders: boolean;
    desktopPush: boolean;
  };
  privacy: {
    profileVisible: boolean;
    activityStatus: boolean;
    peerReviewOptIn: boolean;
    aiPersonalization: boolean;
  };
  security: {
    twoFactor: boolean;
    trustedDevices: boolean;
    sessionAlerts: boolean;
  };
  meta: {
    email: string;
    accountStatus: "active" | "deactivated";
    createdAt?: string;
    updatedAt?: string;
  };
};

type SignupResponse = {
  message: string;
};

type LoginResponse = {
  message: string;
  token: string;
  user: AuthUser;
};

type SettingsResponse = {
  message?: string;
  user?: AuthUser;
  settings: AccountSettings;
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

function authHeaders(token: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getSettingsRequest(token: string): Promise<AccountSettings> {
  const res = await fetch(`${API_URL}/auth/settings`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse<AccountSettings>(res);
}

export async function updateProfileSettingsRequest(
  token: string,
  data: AccountSettings["profile"]
): Promise<SettingsResponse> {
  const res = await fetch(`${API_URL}/auth/settings/profile`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse<SettingsResponse>(res);
}

export async function updatePreferencesRequest(
  token: string,
  data: Partial<Pick<AccountSettings, "notifications" | "privacy" | "security">>
): Promise<SettingsResponse> {
  const res = await fetch(`${API_URL}/auth/settings/preferences`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse<SettingsResponse>(res);
}

export async function updateEmailRequest(
  token: string,
  data: {
    email: string;
    confirmEmail: string;
    password: string;
  }
): Promise<SettingsResponse> {
  const res = await fetch(`${API_URL}/auth/settings/email`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse<SettingsResponse>(res);
}

export async function updatePasswordRequest(
  token: string,
  data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }
): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/auth/settings/password`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });

  return handleResponse<{ message: string }>(res);
}

export async function deactivateAccountRequest(token: string): Promise<SettingsResponse> {
  const res = await fetch(`${API_URL}/auth/settings/deactivate`, {
    method: "POST",
    headers: authHeaders(token),
  });

  return handleResponse<SettingsResponse>(res);
}

export async function deleteAccountRequest(token: string): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/auth/settings/account`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return handleResponse<{ message: string }>(res);
}
