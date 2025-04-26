"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { User, Lock, Mail, Star, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import toast from "react-hot-toast"
import { signIn } from "next-auth/react" 

const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/^(?=.*[a-zA-Z]{7,})(?=.*\d).{8,}$/, { message: "Password must contain at least 7 letters and 1 number" }),
    confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const referral = urlParams.get("ref")
    if (referral) {
      localStorage.setItem("referralCode", referral)
    }
  }, [])

  // Initialize form with react-hook-form and zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true)
      await signIn("google", { 
        callbackUrl: "/app/dashboard"  
      })
      toast.success("Google sign-in successful. Redirecting...")
      setTimeout(() => {
        router.push("/app/dashboard")
      }, 3000)
    } catch (error) {
      console.error("Google login error:", error)
      toast.error("Failed to sign in with Google. Please try again.")
      setGoogleLoading(false) 
    }
  }

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setLoading(true)
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        toast.success("Registration successful! Redirecting to login page...")
        reset()
        setTimeout(() => {
          router.push("/auth/login")
        }, 3000)
      } else {
        const errorData = await res.json()
        // Handle specific error cases
        if (errorData?.message === "Email already exists") {
          setError("email", {
            type: "manual",
            message: "This email is already registered. Please use a different email.",
          })
          toast.error("This email is already registered. Please use a different email.")
        } else if (errorData?.message) {
          toast.error(errorData.message)
        } else {
          toast.error("Registration failed. Please try again.")
        }
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("Server error. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-primary">
      {/* Left side - Registration Form */}
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="h-28 w-70">
              <Image
                src="/images/loginregister/Logo_Intervyou_With_Text.png"
                alt="Intervyou.ai Logo"
                width={320}
                height={80}
                className="h-full w-full"
              />
            </div>
          </div>

          {/* Google Login Button */}
          <Button
            variant="outline"
            className="flex w-full items-center justify-center gap-2 border-gray-700 bg-transparent text-white hover:bg-secondary hover:text-black"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="h-5 w-5">
                <path
                  fill="#EA4335"
                  d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"
                />
                <path
                  fill="#34A853"
                  d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2970142 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"
                />
                <path
                  fill="#4A90E2"
                  d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"
                />
              </svg>
            )}
            {googleLoading ? "Signing in..." : "Login with Google"}
          </Button>

          <div className="flex items-center justify-center">
            <Separator className="w-1/3 bg-gray-700" />
            <span className="px-4 text-sm text-gray-400">Or continue with</span>
            <Separator className="w-1/3 bg-gray-700" />
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Enter Your Name"
                  className={`border-gray-700 bg-transparent pl-10 text-white placeholder:text-gray-500 focus:border-secondary focus:ring-secondary ${errors.name ? "border-red-500" : ""}`}
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-400 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <Input
                  type="email"
                  placeholder="Enter email address"
                  className={`border-gray-700 bg-transparent pl-10 text-white placeholder:text-gray-500 focus:border-secondary focus:ring-secondary ${errors.email ? "border-red-500" : ""}`}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <Input
                  type="password"
                  placeholder="Create Password"
                  className={`border-gray-700 bg-transparent pl-10 text-white placeholder:text-gray-500 focus:border-secondary focus:ring-secondary ${errors.password ? "border-red-500" : ""}`}
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  className={`border-gray-700 bg-transparent pl-10 text-white placeholder:text-gray-500 focus:border-secondary focus:ring-secondary ${errors.confirmPassword ? "border-red-500" : ""}`}
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-400 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-blue-300 hover:text-secondary">
                Forgot password
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#175472] hover:bg-secondary hover:text-black"
              disabled={loading || googleLoading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>

            <div className="text-center text-sm text-gray-400">
              Do you have an account?{" "}
              <Link href="/auth/login" className="text-blue-300 hover:text-secondary hover:underline">
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Testimonial */}
      <div className="hidden flex-1 flex-col items-center justify-center bg-primary p-8 md:flex">
        <div className="max-w-md space-y-8">
          <div className="flex justify-center">
            <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-gray-700">
              <Image
                src="/images/loginregister/CEO.jpg"
                alt="User Profile"
                width={128}
                height={128}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="flex justify-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
            ))}
          </div>

          <div className="text-center text-gray-300">
            <p>Rainbow-Themes is now a crucial component of our work!</p>
            <p>We made it simple to collaborate across departments by grouping our work</p>
          </div>

          <div className="space-y-2 text-center">
            <h3 className="text-2xl font-bold text-white">Guy Hawkins</h3>
            <p className="text-gray-400">Nursing Assistant</p>

            <div className="flex justify-center pt-4">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white">MODX</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}