"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import {
  BellRing,
  CheckCircle2,
  Eye,
  Globe,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { useAuth } from "@/components/auth/auth-provider"
import { AppShell } from "@/components/layout/app-shell"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
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
import { getToken, clearSession } from "@/lib/session"
import { staggerContainer, staggerItem } from "@/lib/animations"
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
  const completed = [
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
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShieldCheck
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/90 p-4 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 via-sky-500/10 to-emerald-500/15">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading: authLoading, setUser } = useAuth()
  const [settings, setSettings] = useState<AccountSettings>(emptySettings)
  const [activeTab, setActiveTab] = useState("profile")
  const [saveMessage, setSaveMessage] = useState("Your latest saved account settings will appear here.")
  const [pageLoading, setPageLoading] = useState(true)
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
    [settings.notifications]
  )
  const enabledPrivacyCount = useMemo(
    () => Object.values(settings.privacy).filter(Boolean).length,
    [settings.privacy]
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
      emailForm.reset({ email: fallbackSettings.meta.email, confirmEmail: "", password: "" })
      setPageLoading(false)
      return
    }

    const loadSettings = async () => {
      try {
        const response = await getSettingsRequest(token)
        setSettings(response)
        profileForm.reset(response.profile)
        emailForm.reset({ email: response.meta.email, confirmEmail: "", password: "" })
        setSaveMessage("Settings loaded from your account.")
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load settings"
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

  async function savePreferences(payload: Partial<Pick<AccountSettings, "notifications" | "privacy" | "security">>) {
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
      setSaveMessage(error instanceof Error ? error.message : "Failed to save preferences.")
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
      const response = await updateProfileSettingsRequest(token, values)
      setSettings(response.settings)
      profileForm.reset(response.settings.profile)
      emailForm.reset({ email: response.settings.meta.email, confirmEmail: "", password: "" })
      if (response.user) {
        setUser(response.user)
      } else {
        syncUserFromSettings(response.settings)
      }
      setSaveMessage(response.message || "Profile updated successfully.")
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
      emailForm.reset({ email: response.settings.meta.email, confirmEmail: "", password: "" })
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
      setSaveMessage(error instanceof Error ? error.message : "Failed to deactivate account.")
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
      setSaveMessage(error instanceof Error ? error.message : "Failed to delete account.")
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

  return (
    <AppShell
      title="Account Settings"
      description="Manage your profile, security, and preferences."
    >
      <motion.div
        className="space-y-6"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.section variants={staggerItem}>
          <Card className="overflow-hidden rounded-3xl border-border/60 bg-gradient-to-br from-card via-card to-primary/5 shadow-xl shadow-black/5">
            <CardContent className="p-0">
              <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-6 p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="rounded-full px-3 py-1">{accountStatusLabel} account</Badge>
                    <Badge variant="outline" className="rounded-full px-3 py-1">
                      Profile completion {profileCompletion}%
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                      Keep your account up to date
                    </h2>
                    <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                      Update your profile, manage sign-in credentials, and control how InterMate personalizes your experience.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <SummaryCard icon={UserRound} label="Profile" value={settings.profile.fullName || "Incomplete"} />
                    <SummaryCard icon={BellRing} label="Notifications" value={`${enabledNotificationCount} enabled`} />
                    <SummaryCard icon={ShieldCheck} label="Security" value={settings.security.twoFactor ? "2FA on" : "2FA off"} />
                  </div>
                </div>

                <div className="border-t border-border/50 bg-background/70 p-6 backdrop-blur-sm sm:p-8 lg:border-l lg:border-t-0">
                  <div className="space-y-3">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-500 text-2xl font-semibold text-white shadow-lg shadow-indigo-500/25">
                      {(settings.profile.fullName || "U")
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {settings.profile.fullName || "Your name"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        @{settings.profile.username || "username"}
                      </p>
                      <p className="text-sm text-muted-foreground">{settings.meta.email || "email@example.com"}</p>
                    </div>
                  </div>

                  <Separator className="my-5" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Privacy controls active</span>
                      <span className="font-medium text-foreground">{enabledPrivacyCount}/4</span>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span>Profile {settings.privacy.profileVisible ? "publicly visible" : "set to private"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={cn("h-4 w-4", settings.security.twoFactor ? "text-emerald-500" : "text-muted-foreground/40")} />
                        <span>Two-factor authentication {settings.security.twoFactor ? "enabled" : "disabled"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={cn("h-4 w-4", settings.privacy.peerReviewOptIn ? "text-emerald-500" : "text-muted-foreground/40")} />
                        <span>Peer reviews {settings.privacy.peerReviewOptIn ? "opted in" : "opted out"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <motion.section variants={staggerItem}>
          <Alert className="rounded-2xl border-border/60 bg-background/85 shadow-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <AlertTitle>{pageLoading ? "Loading settings" : "Sync status"}</AlertTitle>
            <AlertDescription>
              {pageLoading ? "Fetching your account settings from the backend..." : saveMessage}
            </AlertDescription>
          </Alert>
        </motion.section>

        <motion.section variants={staggerItem}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-6">
            <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-2xl bg-muted/70 p-2">
              <TabsTrigger value="profile" className="rounded-xl px-4 py-2">Profile</TabsTrigger>
              <TabsTrigger value="security" className="rounded-xl px-4 py-2">Security</TabsTrigger>
              <TabsTrigger value="notifications" className="rounded-xl px-4 py-2">Notifications</TabsTrigger>
              <TabsTrigger value="privacy" className="rounded-xl px-4 py-2">Privacy</TabsTrigger>
              <TabsTrigger value="appearance" className="rounded-xl px-4 py-2">Appearance</TabsTrigger>
              <TabsTrigger value="danger" className="rounded-xl px-4 py-2">Danger zone</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <Card className="rounded-3xl border-border/60">
                  <CardHeader>
                    <CardTitle>Profile information</CardTitle>
                    <CardDescription>
                      Update your public profile information.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                        <div className="grid gap-5 sm:grid-cols-2">
                          <FormField
                            control={profileForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your full name" disabled={pageLoading} {...field} />
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
                                  <Input placeholder="your_username" disabled={pageLoading} {...field} />
                                </FormControl>
                                <FormDescription>Your unique public handle.</FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="headline"
                            render={({ field }) => (
                              <FormItem className="sm:col-span-2">
                                <FormLabel>Professional headline</FormLabel>
                                <FormControl>
                                  <Input placeholder="Front-end developer with a UX mindset" disabled={pageLoading} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="location"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                  <Input placeholder="City, Country" disabled={pageLoading} {...field} />
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
                                <FormLabel>Education</FormLabel>
                                <FormControl>
                                  <Input placeholder="BS Computer Science" disabled={pageLoading} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="website"
                            render={({ field }) => (
                              <FormItem className="sm:col-span-2">
                                <FormLabel>Website</FormLabel>
                                <FormControl>
                                  <Input placeholder="https://your-portfolio.dev" disabled={pageLoading} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="bio"
                            render={({ field }) => (
                              <FormItem className="sm:col-span-2">
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                  <Textarea
                                    rows={5}
                                    placeholder="Tell people what you are building, learning, and aiming for."
                                    disabled={pageLoading}
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Shown on your public profile. Keep it concise and relevant.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm text-muted-foreground">
                            Last updated: {settings.meta.updatedAt ? new Date(settings.meta.updatedAt).toLocaleString() : "Not available"}
                          </p>
                          <div className="flex flex-col gap-3 sm:flex-row">
                            <Button type="button" variant="outline" onClick={() => profileForm.reset(settings.profile)}>
                              Reset changes
                            </Button>
                            <Button type="submit" disabled={pageLoading || isProfileSaving}>
                              {isProfileSaving ? "Saving profile..." : "Save profile"}
                            </Button>
                          </div>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="rounded-3xl border-border/60">
                    <CardHeader>
                      <CardTitle>Live profile preview</CardTitle>
                      <CardDescription>Previewing the values currently in your form.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                        <p className="text-lg font-semibold text-foreground">{watchedProfile.fullName || "Your name"}</p>
                        <p className="text-sm text-primary">{watchedProfile.headline || "Your headline"}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1 rounded-full bg-background px-3 py-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {watchedProfile.location || "Add location"}
                          </span>
                          {watchedProfile.website ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-background px-3 py-1">
                              <Globe className="h-3.5 w-3.5" />
                              Portfolio linked
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {watchedProfile.bio || "Add a short bio to show what you're building and aiming for."}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="rounded-3xl border-border/60">
                    <CardHeader>
                      <CardTitle>Stored account info</CardTitle>
                      <CardDescription>Read-only account details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center justify-between rounded-2xl border border-border/60 px-4 py-3">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-medium text-foreground">{settings.meta.email || "-"}</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-border/60 px-4 py-3">
                        <span className="text-muted-foreground">Account status</span>
                        <Badge variant={settings.meta.accountStatus === "active" ? "default" : "outline"}>
                          {accountStatusLabel}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-border/60 px-4 py-3">
                        <span className="text-muted-foreground">Created</span>
                        <span className="font-medium text-foreground">
                          {settings.meta.createdAt ? new Date(settings.meta.createdAt).toLocaleDateString() : "-"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security">
              <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-6">
                  <Card className="rounded-3xl border-border/60">
                    <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <CardTitle>Sign-in credentials</CardTitle>
                        <CardDescription>
                          Update your sign-in email and password.
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
                        Protected
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">Primary email</p>
                            <p className="text-sm text-muted-foreground">{settings.meta.email || "No email found"}</p>
                          </div>
                          <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline">
                                <Mail className="h-4 w-4" />
                                Change email
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-xl">
                              <DialogHeader>
                                <DialogTitle>Update email address</DialogTitle>
                                <DialogDescription>
                                  Enter your new email address and confirm with your current password.
                                </DialogDescription>
                              </DialogHeader>
                              <Form {...emailForm}>
                                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                                  <FormField
                                    control={emailForm.control}
                                    name="email"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>New email address</FormLabel>
                                        <FormControl>
                                          <Input type="email" placeholder="name@example.com" {...field} />
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
                                        <FormLabel>Confirm email address</FormLabel>
                                        <FormControl>
                                          <Input type="email" placeholder="Repeat new email" {...field} />
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
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground">Password</p>
                            <p className="text-sm text-muted-foreground">Keep your account secure with a strong password.</p>
                          </div>
                          <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline">
                                <KeyRound className="h-4 w-4" />
                                Change password
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-xl">
                              <DialogHeader>
                                <DialogTitle>Create a stronger password</DialogTitle>
                                <DialogDescription>
                                  You'll need your current password to set a new one.
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
                                    <p className="mb-3 text-sm font-medium text-foreground">Password requirements</p>
                                    <div className="grid gap-2 sm:grid-cols-2">
                                      {passwordChecks.map((check) => (
                                        <div key={check.label} className="flex items-center gap-2 text-sm">
                                          <CheckCircle2
                                            className={cn(
                                              "h-4 w-4",
                                              check.passed ? "text-emerald-500" : "text-muted-foreground/40"
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
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-3xl border-border/60">
                    <CardHeader>
                      <CardTitle>Security controls</CardTitle>
                      <CardDescription>
                        Control authentication and session security.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                              checked
                            )
                          }
                        />
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <Card className="rounded-3xl border-border/60">
                  <CardHeader>
                    <CardTitle>Account activity</CardTitle>
                    <CardDescription>
                      Account metadata and activity details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                      <p className="text-sm font-medium text-foreground">Current account status</p>
                      <p className="mt-1 text-sm text-muted-foreground">{accountStatusLabel}</p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                      <p className="text-sm font-medium text-foreground">Created at</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {settings.meta.createdAt ? new Date(settings.meta.createdAt).toLocaleString() : "Not available"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                      <p className="text-sm font-medium text-foreground">Last updated</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {settings.meta.updatedAt ? new Date(settings.meta.updatedAt).toLocaleString() : "Not available"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="notifications">
              <Card className="rounded-3xl border-border/60">
                <CardHeader>
                  <CardTitle>Notification preferences</CardTitle>
                  <CardDescription>
                    Choose how and when InterMate notifies you.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 lg:grid-cols-2">
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
                          checked
                        )
                      }
                    />
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy">
              <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <Card className="rounded-3xl border-border/60">
                  <CardHeader>
                    <CardTitle>Privacy controls</CardTitle>
                    <CardDescription>
                      Control your visibility and data preferences.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                            checked
                          )
                        }
                      />
                    ))}
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-border/60">
                  <CardHeader>
                    <CardTitle>Visibility summary</CardTitle>
                    <CardDescription>A quick look at your current privacy settings.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Eye className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">Profile visibility</p>
                          <p className="text-sm text-muted-foreground">
                            {settings.privacy.profileVisible
                              ? "Your profile is discoverable to other users."
                              : "Your profile is hidden from public discovery."}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                      <p className="text-sm font-medium text-foreground">AI personalization</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {settings.privacy.aiPersonalization
                          ? "Enabled for smarter personalized suggestions."
                          : "Disabled. Recommendations stay less personalized."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="appearance">
              <ThemeSettings />
            </TabsContent>

            <TabsContent value="danger">
              <Card className="rounded-3xl border-destructive/30 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <Lock className="h-5 w-5" />
                    Danger zone
                  </CardTitle>
                  <CardDescription>
                    Irreversible actions that permanently affect your account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl border border-destructive/20 bg-background/80 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">Deactivate account</p>
                        <p className="text-sm text-muted-foreground">
                          Temporarily disable your account. You can reactivate it by signing back in.
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10 dark:text-amber-300">
                            Deactivate account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deactivate your account?</AlertDialogTitle>
                            <AlertDialogDescription>
                              You will be signed out immediately. Your data will be retained and you can reactivate later.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-amber-600 hover:bg-amber-700"
                              onClick={() => void handleDeactivate()}
                              disabled={isDangerSubmitting}
                            >
                              {isDangerSubmitting ? "Working..." : "Confirm deactivation"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-destructive/20 bg-background/80 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">Delete account permanently</p>
                        <p className="text-sm text-muted-foreground">
                          All data will be permanently removed. This cannot be undone.
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash2 className="h-4 w-4" />
                            Delete account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete account permanently?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action is permanent and cannot be reversed. All your data will be deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep account</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => void handleDelete()}
                              disabled={isDangerSubmitting}
                            >
                              {isDangerSubmitting ? "Deleting..." : "Yes, delete it"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.section>
      </motion.div>
    </AppShell>
  )
}
