"use client"

import { type ReactNode, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { CheckCircle2, Lock, Trash2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { useAuth } from "@/components/auth/auth-provider"
import { AppShell } from "@/components/layout/app-shell"
import { BackButton } from "@/components/layout/back-button"
import { ThemeSettings } from "@/components/settings/theme-settings"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  deactivateAccountRequest,
  deleteAccountRequest,
  getSettingsRequest,
  type AccountSettings,
  updateEmailRequest,
  updatePasswordRequest,
  updatePreferencesRequest,
  updateProfileSettingsRequest,
} from "@/lib/api-auth"
import { staggerContainer, staggerItem } from "@/lib/animations"
import { clearSession, getToken } from "@/lib/session"
import { cn } from "@/lib/utils"

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(20, "Username must be 20 characters or less.")
    .regex(/^[a-zA-Z0-9_]+$/, "Use letters, numbers, and underscores only."),
  headline: z.string().min(4, "Add a short professional headline."),
  location: z.string().min(2, "Location is required."),
  website: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^https?:\/\/.+/.test(value), {
      message: "Website must start with http:// or https://",
    }),
  bio: z
    .string()
    .min(20, "Bio should be at least 20 characters.")
    .max(220, "Bio should stay under 220 characters."),
  education: z.string().max(120, "Education should be 120 characters or less."),
})

const emailSchema = z
  .object({
    email: z.string().email("Enter a valid email address."),
    confirmEmail: z.string().email("Confirm with a valid email address."),
    password: z.string().min(6, "Enter your current password."),
  })
  .refine((values) => values.email === values.confirmEmail, {
    path: ["confirmEmail"],
    message: "Email addresses do not match.",
  })

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Enter your current password."),
    newPassword: z
      .string()
      .min(12, "Use at least 12 characters.")
      .regex(/[A-Z]/, "Include an uppercase letter.")
      .regex(/[a-z]/, "Include a lowercase letter.")
      .regex(/[0-9]/, "Include a number."),
    confirmPassword: z.string().min(12, "Confirm your new password."),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  })

type ProfileValues = z.infer<typeof profileSchema>
type EmailValues = z.infer<typeof emailSchema>
type PasswordValues = z.infer<typeof passwordSchema>

type ToggleItem = {
  key: string
  label: string
  description: string
  badge?: string
}

const notificationItems: ToggleItem[] = [
  {
    key: "mentions",
    label: "Mentions and replies",
    description: "Receive an alert when teammates tag you or reply to your work.",
    badge: "Email",
  },
  {
    key: "weeklyDigest",
    label: "Weekly digest",
    description: "A recap of progress, upcoming deadlines, and mentor feedback.",
  },
  {
    key: "productUpdates",
    label: "Product updates",
    description: "Get notified about new features and workflow improvements.",
  },
  {
    key: "securityAlerts",
    label: "Security alerts",
    description: "Critical notices for unusual sign-ins and account changes.",
    badge: "Required",
  },
  {
    key: "interviewReminders",
    label: "Interview reminders",
    description: "Stay on track with mock interviews and preparation sessions.",
  },
  {
    key: "desktopPush",
    label: "Desktop push",
    description: "Show browser notifications when InterMate is open in a tab.",
  },
]

const privacyItems: ToggleItem[] = [
  {
    key: "profileVisible",
    label: "Public profile visibility",
    description: "Let other users discover your profile and portfolio highlights.",
  },
  {
    key: "activityStatus",
    label: "Activity status",
    description: "Show when you are active so collaborators know when to reach out.",
  },
  {
    key: "peerReviewOptIn",
    label: "Peer review participation",
    description: "Allow peers to invite you into collaborative review sessions.",
  },
  {
    key: "aiPersonalization",
    label: "AI personalization",
    description: "Use your activity and goals to tailor suggestions and learning paths.",
  },
]

const securityItems: ToggleItem[] = [
  {
    key: "twoFactor",
    label: "Two-factor authentication",
    description: "Require an extra code during sign-in for stronger protection.",
  },
  {
    key: "trustedDevices",
    label: "Trusted devices",
    description: "Reduce repeated prompts on devices you use regularly.",
  },
  {
    key: "sessionAlerts",
    label: "New session alerts",
    description: "Notify you every time a new device accesses your account.",
  },
]

const emptySettings: AccountSettings = {
  profile: {
    fullName: "",
    username: "",
    headline: "",
    location: "",
    website: "",
    bio: "",
    education: "",
  },
  notifications: {
    mentions: true,
    weeklyDigest: true,
    productUpdates: false,
    securityAlerts: true,
    interviewReminders: true,
    desktopPush: false,
  },
  privacy: {
    profileVisible: true,
    activityStatus: true,
    peerReviewOptIn: true,
    aiPersonalization: false,
  },
  security: {
    twoFactor: true,
    trustedDevices: true,
    sessionAlerts: true,
  },
  meta: {
    email: "",
    accountStatus: "active",
  },
}

function getProfileCompletion(values: ProfileValues) {
  const optionalWebsite = values.website?.trim() ? 1 : 0
  const completed =
    [
      values.fullName,
      values.username,
      values.headline,
      values.location,
      values.bio,
    ].filter((value) => value.trim().length > 0).length + optionalWebsite

  return Math.min(100, Math.round((completed / 6) * 100))
}

function ToggleCard({
  label,
  description,
  checked,
  onCheckedChange,
  badge,
  disabled,
}: {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  badge?: string
  disabled?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/60 bg-background/80 p-4 shadow-sm backdrop-blur-sm">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {badge ? <Badge variant="outline">{badge}</Badge> : null}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  )
}

function SettingsRow({
  label,
  value,
  action,
}: {
  label: string
  value: string
  action: ReactNode
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border/50 px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-1 truncate text-sm text-muted-foreground">{value}</p>
      </div>
      <div className="sm:shrink-0">{action}</div>
    </div>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading: authLoading, setUser } = useAuth()
  const [settings, setSettings] = useState<AccountSettings>(emptySettings)
  const [activeTab, setActiveTab] = useState("account")
  const [saveMessage, setSaveMessage] = useState(
    "Your latest saved account settings will appear here.",
  )
  const [pageLoading, setPageLoading] = useState(true)
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [isProfileSaving, setIsProfileSaving] = useState(false)
  const [isEmailSaving, setIsEmailSaving] = useState(false)
  const [isPasswordSaving, setIsPasswordSaving] = useState(false)
  const [isPreferenceSaving, setIsPreferenceSaving] = useState(false)
  const [isDangerSubmitting, setIsDangerSubmitting] = useState(false)

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    mode: "onBlur",
    defaultValues: emptySettings.profile,
  })

  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      confirmEmail: "",
      password: "",
    },
  })

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const watchedProfile = profileForm.watch()
  const profileCompletion = getProfileCompletion(watchedProfile)
  const newPasswordValue = passwordForm.watch("newPassword") || ""

  const enabledNotificationCount = useMemo(
    () => Object.values(settings.notifications).filter(Boolean).length,
    [settings.notifications],
  )

  useEffect(() => {
    const token = getToken()

    if (authLoading) return

    if (!token) {
      setPageLoading(false)
      return
    }

    if (token === "demo-token") {
      const fallbackSettings: AccountSettings = {
        ...emptySettings,
        profile: {
          ...emptySettings.profile,
          fullName: user?.name || "",
          username: user?.username || "",
          headline: user?.headline || "",
          location: user?.location || "",
          website: user?.website || "",
          bio: user?.bio || "",
          education: user?.education || "",
        },
        meta: {
          email: user?.email || "",
          accountStatus: "active",
          createdAt: user?.createdAt,
          updatedAt: user?.updatedAt,
        },
      }

      setSettings(fallbackSettings)
      profileForm.reset(fallbackSettings.profile)
      emailForm.reset({
        email: fallbackSettings.meta.email,
        confirmEmail: "",
        password: "",
      })
      setPageLoading(false)
      return
    }

    const loadSettings = async () => {
      try {
        const response = await getSettingsRequest(token)
        setSettings(response)
        profileForm.reset(response.profile)
        emailForm.reset({
          email: response.meta.email,
          confirmEmail: "",
          password: "",
        })
        setSaveMessage("Settings loaded from your account.")
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load settings"
        setSaveMessage(message)
      } finally {
        setPageLoading(false)
      }
    }

    void loadSettings()
  }, [authLoading, emailForm, profileForm, user])

  function syncUserFromSettings(nextSettings: AccountSettings) {
    if (!user) return

    setUser({
      ...user,
      name: nextSettings.profile.fullName,
      email: nextSettings.meta.email,
      location: nextSettings.profile.location,
      education: nextSettings.profile.education,
      username: nextSettings.profile.username,
      headline: nextSettings.profile.headline,
      website: nextSettings.profile.website,
      bio: nextSettings.profile.bio,
      accountStatus: nextSettings.meta.accountStatus,
      updatedAt: nextSettings.meta.updatedAt,
    })
  }

  async function savePreferences(
    payload: Partial<Pick<AccountSettings, "notifications" | "privacy" | "security">>,
  ) {
    const token = getToken()
    if (!token || token === "demo-token") {
      setSaveMessage("Preference changes are available with a connected account.")
      return
    }

    setIsPreferenceSaving(true)

    try {
      const response = await updatePreferencesRequest(token, payload)
      setSettings(response.settings)
      syncUserFromSettings(response.settings)
      setSaveMessage(response.message || "Preferences updated successfully.")
    } catch (error) {
      setSaveMessage(
        error instanceof Error ? error.message : "Failed to save preferences.",
      )
      throw error
    } finally {
      setIsPreferenceSaving(false)
    }
  }

  async function updateSectionSetting<
    TSection extends "notifications" | "privacy" | "security",
    TKey extends keyof AccountSettings[TSection],
  >(section: TSection, key: TKey, checked: boolean) {
    const previousSettings = settings
    const nextSection = {
      ...settings[section],
      [key]: checked,
    } as AccountSettings[TSection]

    setSettings((current) => ({
      ...current,
      [section]: nextSection,
    }))

    try {
      await savePreferences({
        [section]: nextSection,
      } as Partial<Pick<AccountSettings, "notifications" | "privacy" | "security">>)
    } catch {
      setSettings(previousSettings)
    }
  }

  async function onProfileSubmit(values: ProfileValues) {
    const token = getToken()
    if (!token || token === "demo-token") {
      setSaveMessage("Profile editing requires a connected account.")
      return
    }

    setIsProfileSaving(true)

    try {
      const payload = {
        ...values,
        website: values.website ?? "",
      }
      const response = await updateProfileSettingsRequest(token, payload)
      setSettings(response.settings)
      profileForm.reset(response.settings.profile)
      emailForm.reset({
        email: response.settings.meta.email,
        confirmEmail: "",
        password: "",
      })
      if (response.user) {
        setUser(response.user)
      } else {
        syncUserFromSettings(response.settings)
      }
      setSaveMessage(response.message || "Profile updated successfully.")
      setProfileDialogOpen(false)
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Failed to save profile.")
    } finally {
      setIsProfileSaving(false)
    }
  }

  async function onEmailSubmit(values: EmailValues) {
    const token = getToken()
    if (!token || token === "demo-token") {
      setSaveMessage("Email changes require a connected account.")
      return
    }

    setIsEmailSaving(true)

    try {
      const response = await updateEmailRequest(token, values)
      setSettings(response.settings)
      profileForm.reset(response.settings.profile)
      emailForm.reset({
        email: response.settings.meta.email,
        confirmEmail: "",
        password: "",
      })
      if (response.user) {
        setUser(response.user)
      } else {
        syncUserFromSettings(response.settings)
      }
      setSaveMessage(response.message || "Email updated successfully.")
      setEmailDialogOpen(false)
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Failed to update email.")
    } finally {
      setIsEmailSaving(false)
    }
  }

  async function onPasswordSubmit(values: PasswordValues) {
    const token = getToken()
    if (!token || token === "demo-token") {
      setSaveMessage("Password changes require a connected account.")
      return
    }

    setIsPasswordSaving(true)

    try {
      const response = await updatePasswordRequest(token, values)
      passwordForm.reset()
      setSaveMessage(response.message || "Password updated successfully.")
      setPasswordDialogOpen(false)
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Failed to update password.")
    } finally {
      setIsPasswordSaving(false)
    }
  }

  async function handleDeactivate() {
    const token = getToken()
    if (!token || token === "demo-token") {
      setSaveMessage("Account deactivation requires a connected account.")
      return
    }

    setIsDangerSubmitting(true)

    try {
      await deactivateAccountRequest(token)
      clearSession()
      setUser(null)
      router.push("/login")
    } catch (error) {
      setSaveMessage(
        error instanceof Error ? error.message : "Failed to deactivate account.",
      )
    } finally {
      setIsDangerSubmitting(false)
    }
  }

  async function handleDelete() {
    const token = getToken()
    if (!token || token === "demo-token") {
      setSaveMessage("Account deletion requires a connected account.")
      return
    }

    setIsDangerSubmitting(true)

    try {
      await deleteAccountRequest(token)
      clearSession()
      setUser(null)
      router.push("/signup")
    } catch (error) {
      setSaveMessage(
        error instanceof Error ? error.message : "Failed to delete account.",
      )
    } finally {
      setIsDangerSubmitting(false)
    }
  }

  const accountStatusLabel =
    settings.meta.accountStatus === "deactivated" ? "Deactivated" : "Active"

  const passwordChecks = [
    {
      label: "At least 12 characters",
      passed: newPasswordValue.length >= 12,
    },
    {
      label: "One uppercase letter",
      passed: /[A-Z]/.test(newPasswordValue),
    },
    {
      label: "One lowercase letter",
      passed: /[a-z]/.test(newPasswordValue),
    },
    {
      label: "One number",
      passed: /[0-9]/.test(newPasswordValue),
    },
  ]

  const avatarInitials = (settings.profile.fullName || "User")
    .split(" ")
    .map((part) => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const timezoneLabel = Intl.DateTimeFormat().resolvedOptions().timeZone || "Not set"
  const roleLabel = user?.role || "Job Seeker"

  return (
    <AppShell
      title="Settings"
      description="Manage your account and preferences."
      showBack={false}
    >
      <motion.div
        className="mx-auto max-w-5xl space-y-6"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.section variants={staggerItem} className="space-y-2">
          <BackButton />
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground">
            Update your account details and preferences.
          </p>
        </motion.section>

        <motion.section variants={staggerItem}>
          <Alert className="rounded-2xl border-primary/20 bg-primary/5 text-primary shadow-sm">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Updates</AlertTitle>
            <AlertDescription className="text-primary/90">{saveMessage}</AlertDescription>
          </Alert>
        </motion.section>

        <motion.section variants={staggerItem}>
          <div className="rounded-3xl border border-border/60 bg-card/80 p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-lg font-semibold text-primary">
                    {avatarInitials}
                  </div>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="outline"
                    className="absolute -bottom-1 -right-1 rounded-full border-border/70 bg-card px-2 text-[10px]"
                    onClick={() => setProfileDialogOpen(true)}
                  >
                    Edit
                  </Button>
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-foreground">
                    {settings.profile.fullName || "Your name"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {settings.meta.email || "No email set"}
                  </p>
                  <Badge variant="outline" className="w-fit rounded-full">
                    {roleLabel}
                  </Badge>
                </div>
              </div>
              <Badge className="w-fit rounded-full border-primary/20 bg-primary/10 text-primary">
                {accountStatusLabel}
              </Badge>
            </div>
          </div>
        </motion.section>

        <motion.section variants={staggerItem}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
            <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-none border-b border-border bg-transparent p-0">
              {[
                { value: "account", label: "Account" },
                { value: "profile", label: "Profile" },
                { value: "preferences", label: "Preferences" },
                { value: "security", label: "Security" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className={cn(
                    "rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground",
                  )}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="account" className="mt-0">
              <div className="rounded-3xl border border-border/60 bg-card/80 shadow-sm">
                <SettingsRow
                  label="Name"
                  value={settings.profile.fullName || "Not set"}
                  action={
                    <Button variant="ghost" size="sm" onClick={() => setProfileDialogOpen(true)}>
                      Edit
                    </Button>
                  }
                />
                <SettingsRow
                  label="Email"
                  value={settings.meta.email || "Not set"}
                  action={
                    <Button variant="ghost" size="sm" onClick={() => setEmailDialogOpen(true)}>
                      Edit
                    </Button>
                  }
                />
                <SettingsRow
                  label="Phone number"
                  value="Not set"
                  action={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setSaveMessage(
                          "Phone number editing is not configured for this account yet.",
                        )
                      }
                    >
                      Edit
                    </Button>
                  }
                />
                <SettingsRow
                  label="Country"
                  value={settings.profile.location || "Not set"}
                  action={
                    <Button variant="ghost" size="sm" onClick={() => setProfileDialogOpen(true)}>
                      Edit
                    </Button>
                  }
                />
                <SettingsRow
                  label="Timezone"
                  value={timezoneLabel}
                  action={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setSaveMessage("Timezone follows your device and browser settings.")
                      }
                    >
                      Edit
                    </Button>
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="profile" className="mt-0">
              <div className="rounded-3xl border border-border/60 bg-card/80 shadow-sm">
                <SettingsRow
                  label="Target role"
                  value={settings.profile.headline || "Not set"}
                  action={
                    <Button variant="ghost" size="sm" onClick={() => setProfileDialogOpen(true)}>
                      Edit
                    </Button>
                  }
                />
                <SettingsRow
                  label="Job category"
                  value={settings.profile.education || "Not set"}
                  action={
                    <Button variant="ghost" size="sm" onClick={() => setProfileDialogOpen(true)}>
                      Edit
                    </Button>
                  }
                />
                <SettingsRow
                  label="Experience level"
                  value={profileCompletion > 75 ? "Advanced profile" : "In progress"}
                  action={
                    <Button variant="ghost" size="sm" onClick={() => setProfileDialogOpen(true)}>
                      Edit
                    </Button>
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="mt-0 space-y-4">
              <div className="rounded-3xl border border-border/60 bg-card/80 shadow-sm">
                <SettingsRow
                  label="Theme"
                  value="Light, dark, or system"
                  action={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setSaveMessage(
                          "Use the theme controls below to update appearance.",
                        )
                      }
                    >
                      Edit
                    </Button>
                  }
                />
                <SettingsRow
                  label="Notifications"
                  value={`${enabledNotificationCount} enabled`}
                  action={<span className="text-xs text-muted-foreground">Manage below</span>}
                />
                <SettingsRow
                  label="Language"
                  value={navigator.language || "Not set"}
                  action={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSaveMessage("Language follows your browser settings.")}
                    >
                      Edit
                    </Button>
                  }
                />
              </div>

              <ThemeSettings />

              <Card className="rounded-3xl border-border/60">
                <CardHeader>
                  <CardTitle className="text-base">Notification Preferences</CardTitle>
                  <CardDescription>Choose which updates you want to receive.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notificationItems.map((item) => (
                    <ToggleCard
                      key={item.key}
                      label={item.label}
                      description={item.description}
                      badge={item.badge}
                      checked={settings.notifications[item.key as keyof AccountSettings["notifications"]]}
                      disabled={pageLoading || isPreferenceSaving}
                      onCheckedChange={(checked) =>
                        void updateSectionSetting(
                          "notifications",
                          item.key as keyof AccountSettings["notifications"],
                          checked,
                        )
                      }
                    />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-0 space-y-4">
              <div className="rounded-3xl border border-border/60 bg-card/80 shadow-sm">
                <SettingsRow
                  label="Password"
                  value="Last updated securely"
                  action={
                    <Button variant="ghost" size="sm" onClick={() => setPasswordDialogOpen(true)}>
                      Edit
                    </Button>
                  }
                />
                <SettingsRow
                  label="Login security"
                  value={`${Object.values(settings.security).filter(Boolean).length} protections enabled`}
                  action={<span className="text-xs text-muted-foreground">Manage below</span>}
                />
              </div>

              <Card className="rounded-3xl border-border/60">
                <CardHeader>
                  <CardTitle className="text-base">Security Controls</CardTitle>
                  <CardDescription>Control sign-in and session safety options.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {securityItems.map((item) => (
                    <ToggleCard
                      key={item.key}
                      label={item.label}
                      description={item.description}
                      checked={settings.security[item.key as keyof AccountSettings["security"]]}
                      disabled={pageLoading || isPreferenceSaving}
                      onCheckedChange={(checked) =>
                        void updateSectionSetting(
                          "security",
                          item.key as keyof AccountSettings["security"],
                          checked,
                        )
                      }
                    />
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-border/60">
                <CardHeader>
                  <CardTitle className="text-base">Privacy Controls</CardTitle>
                  <CardDescription>Control visibility and personalization settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {privacyItems.map((item) => (
                    <ToggleCard
                      key={item.key}
                      label={item.label}
                      description={item.description}
                      checked={settings.privacy[item.key as keyof AccountSettings["privacy"]]}
                      disabled={pageLoading || isPreferenceSaving}
                      onCheckedChange={(checked) =>
                        void updateSectionSetting(
                          "privacy",
                          item.key as keyof AccountSettings["privacy"],
                          checked,
                        )
                      }
                    />
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-destructive/30 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base text-destructive">
                    <Lock className="h-4 w-4" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>Sensitive actions for your account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-3 rounded-2xl border border-destructive/20 bg-background/80 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Deactivate account</p>
                      <p className="text-sm text-muted-foreground">
                        You can reactivate by signing in again.
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10 dark:text-amber-300"
                        >
                          Deactivate
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Deactivate your account?</AlertDialogTitle>
                          <AlertDialogDescription>
                            You will be signed out immediately and can reactivate later.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-amber-600 hover:bg-amber-700"
                            onClick={() => void handleDeactivate()}
                            disabled={isDangerSubmitting}
                          >
                            {isDangerSubmitting ? "Working..." : "Confirm"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <div className="flex flex-col gap-3 rounded-2xl border border-destructive/20 bg-background/80 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Delete account permanently
                      </p>
                      <p className="text-sm text-muted-foreground">
                        This action cannot be undone.
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete account permanently?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This permanently removes your account and data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep account</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => void handleDelete()}
                            disabled={isDangerSubmitting}
                          >
                            {isDangerSubmitting ? "Deleting..." : "Delete account"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.section>

        <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>Update your profile details.</DialogDescription>
            </DialogHeader>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={profileForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input placeholder="Alex Morgan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="alex_morgan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={profileForm.control}
                  name="headline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target role</FormLabel>
                      <FormControl>
                        <Input placeholder="Marketing Analyst" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={profileForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country / location</FormLabel>
                        <FormControl>
                          <Input placeholder="Lahore, Pakistan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name="education"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job category</FormLabel>
                        <FormControl>
                          <Input placeholder="Business / Management" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={profileForm.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://your-portfolio.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="Tell people about your goals." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setProfileDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isProfileSaving || !profileForm.formState.isDirty}>
                    {isProfileSaving ? "Saving..." : "Save changes"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Update email address</DialogTitle>
              <DialogDescription>Confirm your current password to continue.</DialogDescription>
            </DialogHeader>
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={emailForm.control}
                  name="confirmEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Confirm email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={emailForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Enter current password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEmailDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!emailForm.formState.isValid || isEmailSaving}>
                    {isEmailSaving ? "Updating..." : "Update email"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Change password</DialogTitle>
              <DialogDescription>
                Use a strong password to keep your account secure.
              </DialogDescription>
            </DialogHeader>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Current password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Create a secure password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm new password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Repeat new password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                  <p className="mb-3 text-sm font-medium text-foreground">
                    Password requirements
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {passwordChecks.map((check) => (
                      <div key={check.label} className="flex items-center gap-2 text-sm">
                        <CheckCircle2
                          className={cn(
                            "h-4 w-4",
                            check.passed ? "text-emerald-500" : "text-muted-foreground/40",
                          )}
                        />
                        <span className={check.passed ? "text-foreground" : "text-muted-foreground"}>
                          {check.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setPasswordDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!passwordForm.formState.isValid || isPasswordSaving}>
                    {isPasswordSaving ? "Saving..." : "Save password"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </motion.div>
    </AppShell>
  )
}
