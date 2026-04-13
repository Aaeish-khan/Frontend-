export type LocalUser = {
  id: string
  name: string
  email: string
  password: string
  level?: number
  xp?: number
  streak?: number
  avatar?: string
}

const USERS_KEY = "intermate_users"
const SESSION_KEY = "intermate_session"

export function getUsers(): LocalUser[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(USERS_KEY)
  return raw ? JSON.parse(raw) : []
}

export function saveUsers(users: LocalUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function signupUser(data: Omit<LocalUser, "id">) {
  const users = getUsers()
  const exists = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase())
  if (exists) throw new Error("User already exists with this email")

  const newUser: LocalUser = {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()),
    name: data.name,
    email: data.email,
    password: data.password,
    level: data.level ?? 1,
    xp: data.xp ?? 0,
    streak: data.streak ?? 0,
    avatar: data.avatar ?? "/placeholder-user.jpg",
  }

  users.push(newUser)
  saveUsers(users)
  localStorage.setItem(SESSION_KEY, JSON.stringify(newUser))
  return newUser
}

export function loginUser(email: string, password: string) {
  const users = getUsers()
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
  )

  if (!user) throw new Error("Invalid email or password")

  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  return user
}

export function getSessionUser(): LocalUser | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(SESSION_KEY)
  return raw ? JSON.parse(raw) : null
}

export function logoutUser() {
  if (typeof window === "undefined") return
  localStorage.removeItem(SESSION_KEY)
}
