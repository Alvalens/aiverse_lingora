"use client"
import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Check, Loader2, Mail, Lock, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"
import { signIn } from "next-auth/react"

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/^(?=.*[a-zA-Z]{7,})(?=.*\d).{8,}$/, { message: "Password must contain at least 7 letters and 1 number" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [rememberMe, setRememberMe] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })
  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true)
      await signIn("google", {
        callbackUrl: "/app/dashboard?auth_success=true"
      })
    } catch (error) {
      console.error(error)
      toast.error("Failed to sign in with Google. Please try again.")
      setGoogleLoading(false)
    }
  }
  const onSubmit = async (data: LoginFormValues) => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      })

      if (result?.error) {
        setError("email", {
          type: "manual",
          message: "Invalid email or password",
        })
        setError("password", {
          type: "manual",
          message: "Invalid email or password",
        })
        toast.error("Invalid email or password")
      } else {
        // Redirect with auth_success parameter to trigger success toast
        router.push("/app/dashboard?auth_success=true")
      }
    } catch (error) {
      console.error(error)
      toast.error("Server error. Please try again later.")
    }
  }
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-primary lg:flex-row">
      <div className="relative hidden lg:block lg:w-1/2">
        <div className="absolute inset-0">
          <Image src="/images/loginregister/CEO.jpg" alt="CEO Background" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="absolute left-6 top-6 z-10">
          <Image
            src="/images/loginregister/Logo-Intervyou.png"
            alt="Logo"
            width={300}
            height={72}
            className="h-12 w-auto"
            priority
          />
        </div>

        <div className="relative z-10 flex h-full flex-col items-start justify-end p-12">
          <div className="max-w-lg">
            <p className="mb-4 text-2xl font-medium text-white drop-shadow-md">
              This software simplifies the website building process, making it a breeze to manage our online presence.
            </p>
            <div>
              <p className="font-semibold text-white drop-shadow-md">David Henderson</p>
              <p className="text-sm text-gray-200 drop-shadow-md">Founder & CEO</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-1 flex-col justify-center px-4 py-4 lg:w-1/2 lg:px-12 lg:py-0">
        <div className="mx-auto w-full max-w-md">
          <h1 className="mb-4 text-center text-2xl font-semibold text-white lg:mb-8 lg:text-3xl">Login Page</h1>

          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            className="mb-4 w-full justify-center gap-2 border-gray-700 bg-transparent py-4 text-white hover:bg-secondary hover:text-black lg:mb-6 lg:py-6"
            disabled={googleLoading || isSubmitting}
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
            {googleLoading ? "Login..." : "Login with Google"}
          </Button>

          <div className="relative mb-4 lg:mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-primary px-2 text-gray-400">OR</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 lg:space-y-4">
            <div className="space-y-1">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <Input
                  type="email"
                  placeholder="Your email"
                  className={`border-gray-700 bg-transparent py-4 pl-10 text-white placeholder:text-gray-400 focus:border-secondary focus:ring-secondary lg:py-6 ${errors.email ? "border-red-500" : ""}`}
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
                  placeholder="Password"
                  className={`border-gray-700 bg-transparent py-4 pl-10 text-white placeholder:text-gray-400 focus:border-secondary focus:ring-secondary lg:py-6 ${errors.password ? "border-red-500" : ""}`}
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

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="relative flex h-4 w-4 items-center justify-center lg:h-5 lg:w-5">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="custom-checkbox peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-600 bg-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 focus:ring-offset-primary checked:border-secondary checked:bg-secondary lg:h-5 lg:w-5"
                  />
                  {rememberMe && <Check className="pointer-events-none absolute text-white" size={12} />}
                </div>
                <label htmlFor="remember" className="cursor-pointer text-xs font-medium text-gray-300 lg:text-sm">
                  Remember me?
                </label>
              </div>
              <a href="/forgot-password" className="text-xs font-medium text-blue-300 hover:text-secondary lg:text-sm">
                Forgot password
              </a>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#175472] py-4 hover:bg-secondary hover:text-black lg:py-6"
              disabled={isSubmitting || googleLoading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Log in"
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-gray-300 lg:mt-6 lg:text-sm">
            Have no account yet?{" "}
            <a href="/auth/register" className="font-medium text-blue-300 hover:text-secondary hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

