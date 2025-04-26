"use client"

import { useState } from "react"
import { useSession, signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "react-hot-toast"
import ErrorMessage from "@/components/error-message"
import StepNavigation from "../step-navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const updateEmailSchema = z
  .object({
    newEmail: z.string().email({ message: "Please enter a valid email address" }),
    currentPassword: z.string().min(8, { message: "Current password must be at least 8 characters" }),
    newPassword: z
      .union([z.literal(""), z.string().min(8, { message: "New password must be at least 8 characters" })])
      .transform((val) => (val === "" ? undefined : val))
      .optional(),
    confirmNewPassword: z
      .union([z.literal(""), z.string().min(8, { message: "Confirmation must be at least 8 characters" })])
      .transform((val) => (val === "" ? undefined : val))
      .optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword || data.confirmNewPassword) {
        return data.newPassword === data.confirmNewPassword
      }
      return true
    },
    {
      message: "New passwords do not match",
      path: ["confirmNewPassword"],
    },
  )

interface EmailVerificationStepProps {
  emailTimer: number
  isEmailVerified: boolean
  isSubmitting: boolean
  setIsSubmitting: (value: boolean) => void
  error: string
  setError: (value: string) => void
  setEmailTimer: (value: number) => void
  onContinue: () => void
}

export default function EmailVerificationStep({
  emailTimer,
  isEmailVerified,
  isSubmitting,
  setIsSubmitting,
  error,
  setEmailTimer,
  onContinue,
}: EmailVerificationStepProps) {
  const { data: session } = useSession()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showPasswordFields, setShowPasswordFields] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(updateEmailSchema),
    defaultValues: { newEmail: "", currentPassword: "", newPassword: "", confirmNewPassword: "" },
  })

  const handleSendVerificationEmail = async () => {
    setIsSubmitting(true)
    const email = session?.user?.email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      toast.error("Email tidak valid. Pastikan menggunakan email yang benar.")
      setIsSubmitting(false)
      return
    }
    try {
      const limiterRes = await fetch("/api/auth/email-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session?.user?.id, email }),
      })
      const limiterData = await limiterRes.json()
      if (!limiterRes.ok) {
        if (limiterData.error && limiterData.error.includes("Email not available")) {
          setIsDialogOpen(true)
        }
        toast.error(limiterData.error || "Error sending verification email.")
        setIsSubmitting(false)
        return
      }
      const result = await signIn("email", { email, redirect: false })
      if (result?.ok) {
        toast.success("Verification email sent. Please check your email.")
        const timerDuration = 300
        setEmailTimer(timerDuration)
        localStorage.setItem("emailTimerExpires", (Date.now() + timerDuration * 1000).toString())
      } else {
        toast.error(result?.error || "Error sending verification email.")
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error:", error.message)
      } else {
        console.error("Unknown error:", error)
      }
      toast.error("Error sending verification email.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const onSubmit = async (data: { newEmail: string; currentPassword: string; newPassword?: string }) => {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/auth/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const responseData = await res.json()
      if (!res.ok) {
        if (responseData.error === "Email already in use") {
          toast.error("The email address is already registered. Please use a different email.")
        } else {
          toast.error(responseData.error || "Failed to update email.")
        }
      } else {
        toast.success("Email and password updated successfully.")
        reset()
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error("Error updating email:", error)
      toast.error("Error updating email.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (sec: number) => {
    const minutes = Math.floor(sec / 60)
    const seconds = sec % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="max-w-xl mx-auto text-center text-color-text">
      <h2 className="text-2xl font-bold mb-6">Email Verification</h2>
      <p className="mb-6">
        Please verify your email address. A verification link will be sent to <strong>{session?.user?.email}</strong>.
      </p>

      <ErrorMessage message={error} />

      <button
        onClick={handleSendVerificationEmail}
        className={`bg-primary border-2 border-tertiary text-color-text py-2 px-6 rounded-lg font-medium transition-colors hover:bg-tertiary hover:text-white ${
          isSubmitting || emailTimer > 0 || isEmailVerified ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={isSubmitting || emailTimer > 0 || isEmailVerified}
      >
        {isSubmitting
          ? "Sending..."
          : emailTimer > 0
            ? `Resend in ${formatTime(emailTimer)}`
            : "Send Verification Email"}
      </button>

      {emailTimer > 0 && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <button className="mt-2 text-base text-red-600 underline mx-auto block">Not receiving email?</button>
          </DialogTrigger>
          <DialogContent className="bg-secondary p-6 rounded-lg shadow-lg w-full max-w-md mx-auto fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <button
              onClick={() => setIsDialogOpen(false)}
              className="absolute top-4 right-4 text-color-text text-xl font-bold"
              aria-label="Close"
            >
              &times;
            </button>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-color-text">Update Email</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <Input type="email" placeholder="New Email" {...register("newEmail")} className="text-color-text" required />
              {errors.newEmail && <p className="text-xs text-red-400">{errors.newEmail.message}</p>}

              <Input
                type="password"
                placeholder="Current Password"
                {...register("currentPassword")}
                className="text-color-text"
                required
              />
              {errors.currentPassword && <p className="text-xs text-red-400">{errors.currentPassword.message}</p>}

              {/* Toggler Button */}
              <button
                type="button"
                onClick={() => setShowPasswordFields(!showPasswordFields)}
                className="text-base text-color-text underline"
              >
                {showPasswordFields ? "Hide Password Fields" : "Set New Password"}
              </button>

              {/* Conditional Rendering for Password Fields */}
              {showPasswordFields && (
                <>
                  <Input
                    type="password"
                    placeholder="New Password (Optional)"
                    {...register("newPassword")}
                    className="text-white"
                  />
                  {errors.newPassword && <p className="text-xs text-red-400">{errors.newPassword.message}</p>}

                  <Input
                    type="password"
                    placeholder="Confirm New Password"
                    {...register("confirmNewPassword")}
                    className="text-white"
                  />
                  {errors.confirmNewPassword && (
                    <p className="text-xs text-red-400">{errors.confirmNewPassword.message}</p>
                  )}
                </>
              )}

              <Button
                type="submit"
                className="bg-primary text-color-text border-2 border-tertiary w-full hover:bg-tertiary hover:text-white hover:border-tertiary"
              >
                Update Email
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <div className="mt-8">
        <StepNavigation
          hideBack={true}
          onContinue={onContinue}
          isContinueDisabled={!isEmailVerified}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  )
}
