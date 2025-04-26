"use client"

import { useQuery } from "@tanstack/react-query"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { Toaster, toast } from "react-hot-toast"
import { useState } from "react"
import Image from "next/image"
import type { TokenPack } from "@prisma/client"

declare global {
  interface Window {
    snap: {
      pay: (token: string, callbacks: any) => void
    }
  }
}

const fetchTokenPacks = async () => {
  const response = await fetch("/api/tokenpacks")
  if (!response.ok) {
    throw new Error("Network response was not ok")
  }
  return response.json()
}

// SVG components
const YellowCrown = () => (
  <svg width="54" height="52" viewBox="0 0 54 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M27 48L4.4603 22.6428C3.26164 21.2943 2.66231 20.6201 2.50428 19.7801C2.34624 18.9401 2.65956 18.0942 3.28619 16.4023L5.2677 11.0522C6.70992 7.15822 7.43103 5.21122 9.01952 4.10561C10.608 3 12.6843 3 16.8368 3H37.1632C41.3157 3 43.392 3 44.9805 4.10561C46.569 5.21122 47.2901 7.15822 48.7323 11.0522L50.7138 16.4023C51.3404 18.0942 51.6538 18.9401 51.4957 19.7801C51.3377 20.6201 50.7384 21.2943 49.5397 22.6428L27 48ZM27 48L37.9375 17.0625M27 48L16.0625 17.0625M50.4375 19.875L37.9375 17.0625M37.9375 17.0625L33.25 5.8125M37.9375 17.0625H16.0625M20.75 5.8125L16.0625 17.0625M16.0625 17.0625L3.5625 19.875"
      stroke="url(#paint0_linear_1021_1428)"
      strokeWidth="4.31797"
      strokeLinecap="round"
    />
    <defs>
      <linearGradient id="paint0_linear_1021_1428" x1="27" y1="3" x2="27" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FDCB1A" />
        <stop offset="1" stopColor="#E08200" />
      </linearGradient>
    </defs>
  </svg>
)
const GreenCrown = () => (
  <svg width="54" height="52" viewBox="0 0 54 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M27 48L4.4603 22.6428C3.26164 21.2943 2.66231 20.6201 2.50428 19.7801C2.34624 18.9401 2.65956 18.0942 3.28619 16.4023L5.2677 11.0522C6.70992 7.15822 7.43103 5.21122 9.01952 4.10561C10.608 3 12.6843 3 16.8368 3H37.1632C41.3157 3 43.392 3 44.9805 4.10561C46.569 5.21122 47.2901 7.15822 48.7323 11.0522L50.7138 16.4023C51.3404 18.0942 51.6538 18.9401 51.4957 19.7801C51.3377 20.6201 50.7384 21.2943 49.5397 22.6428L27 48ZM27 48L37.9375 17.0625M27 48L16.0625 17.0625M50.4375 19.875L37.9375 17.0625M37.9375 17.0625L33.25 5.8125M37.9375 17.0625H16.0625M20.75 5.8125L16.0625 17.0625M16.0625 17.0625L3.5625 19.875"
      stroke="url(#paint0_linear_1021_1438)"
      strokeWidth="4.31797"
      strokeLinecap="round"
    />
    <defs>
      <linearGradient id="paint0_linear_1021_1438" x1="27" y1="3" x2="27" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#48E07B" />
        <stop offset="1" stopColor="#007928" />
      </linearGradient>
    </defs>
  </svg>
)
const RedCrown = () => (
  <svg width="54" height="52" viewBox="0 0 54 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M27 48L4.4603 22.6428C3.26164 21.2943 2.66231 20.6201 2.50428 19.7801C2.34624 18.9401 2.65956 18.0942 3.28619 16.4023L5.2677 11.0522C6.70992 7.15822 7.43103 5.21122 9.01952 4.10561C10.608 3 12.6843 3 16.8368 3H37.1632C41.3157 3 43.392 3 44.9805 4.10561C46.569 5.21122 47.2901 7.15822 48.7323 11.0522L50.7138 16.4023C51.3404 18.0942 51.6538 18.9401 51.4957 19.7801C51.3377 20.6201 50.7384 21.2943 49.5397 22.6428L27 48ZM27 48L37.9375 17.0625M27 48L16.0625 17.0625M50.4375 19.875L37.9375 17.0625M37.9375 17.0625L33.25 5.8125M37.9375 17.0625H16.0625M20.75 5.8125L16.0625 17.0625M16.0625 17.0625L3.5625 19.875"
      stroke="url(#paint0_linear_1021_1439)"
      strokeWidth="4.31797"
      strokeLinecap="round"
    />
    <defs>
      <linearGradient id="paint0_linear_1021_1439" x1="27" y1="3" x2="27" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F77170" />
        <stop offset="1" stopColor="#E42F2D" />
      </linearGradient>
    </defs>
  </svg>
)

function getCrownIcon(packId: number) {
  switch (packId) {
    case 1:
      return <YellowCrown />
    case 2:
      return <GreenCrown />
    case 3:
      return <RedCrown />
    default:
      return null
  }
}

const getTitleColor = (packId: number) => {
  switch (packId) {
    case 1:
      return "text-yellow-400"
    case 2:
      return "text-green-400"
    case 3:
      return "text-red-400"
    default:
      return "text-color-text"
  }
}

// Ganti dengan link SVG baru (pastikan file SVG ini benar-benar ada di storage Anda)
const SVG_BG_HOVER = "https://files.aiverse.id/assets/shop-hover.svg"
const SVG_BG_TRANSPARENT = "https://files.aiverse.id/assets/shop-transparent.svg"

export default function ShopPage() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["tokenPacks"],
    queryFn: fetchTokenPacks,
  })

  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [expandedFeatures, setExpandedFeatures] = useState<Record<number, boolean>>({})

  if (isLoading) return <div className="flex justify-center items-center h-screen text-color-text">Loading token packs...</div>
  if (error) return <div className="flex justify-center items-center h-screen text-color-text">Error loading token packs.</div>

  const tokenPacks: TokenPack[] = data.tokenPacks

  const enhancedTokenPacks = tokenPacks.map((pack) => {
    const features = [
      `${pack.tokens.toLocaleString()} tokens`,
      "Access to all AI models",
      "No expiration date",
      "Priority support",
    ]
    return {
      ...pack,
      features,
      popular: pack.id === 2,
    }
  })

  const toggleFeatures = (packId: number) => {
    setExpandedFeatures((prev) => ({
      ...prev,
      [packId]: !prev[packId],
    }))
  }

  const handleBuy = async (packId: number) => {
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packId,
        }),
      })

      if (!response.ok) {
        console.error("Failed to initiate token purchase")
        return
      }

      const { token } = await response.json()

      window.snap.pay(token, {
        onSuccess: async (result: any) => {
          try {
            const res = await fetch("/api/transactions/callback", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                order_id: result.order_id,
                transaction_status: result.transaction_status,
                fraud_status: result.fraud_status || "",
              }),
            })
            if (!res.ok) {
              throw new Error("Failed to update transaction status")
            }
            toast.success("Payment success!")
          } catch (err) {
            console.error(err)
            toast.error("Payment failed!")
          }
        },
        onPending: () => {
          toast("Waiting for your payment...")
        },
        onError: async (result: any) => {
          try {
            const res = await fetch("/api/transactions/callback", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                order_id: result.order_id,
                transaction_status: result.transaction_status,
                fraud_status: result.fraud_status || "",
              }),
            })
            if (!res.ok) {
              throw new Error("Failed to update transaction status")
            }
            toast.error("Payment failed!")
          } catch (err) {
            console.error(err)
            toast.error("Payment failed!")
          }
        },
        onClose: () => {
          toast("You closed the payment popup without finishing the payment.")
        },
      })
    } catch (error) {
      console.error("Error in handleBuy:", error)
      toast.error("Failed to process purchase")
    }
  }

  return (
    <div className="min-h-screen bg-primary text-color-text py-8 px-2">
      <Toaster position="top-center" />
      <div className="max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-color-text">Available Token Packs</h1>
          <p className="mt-4 text-lg text-color-text">
            Explore our plans and choose the best one for your needs. Each plan is tailored to help you achieve your
            goals efficiently.
          </p>
        </div>

        {/* Card Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {enhancedTokenPacks.map((pack) => (
            <div
              key={pack.id}
              className="relative flex flex-col h-full"
              onMouseEnter={() => setHoveredCard(pack.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Best Offer Badge */}
              {pack.popular && (
                <div className="absolute -top-5 left-0 right-0 z-20 flex justify-center">
                  <div className="bg-yellow-500 text-black px-5 py-1.5 text-base font-bold rounded-md shadow-lg">
                    Best Offer
                  </div>
                </div>
              )}

              {/* Card utama */}
              <div
                className={`relative w-full transition-all duration-300 ease-in-out ${
                  expandedFeatures[pack.id] ? "min-h-[620px]" : "min-h-[520px]"
                } md:min-h-[560px] lg:min-h-[600px] h-full rounded-2xl overflow-visible flex flex-col justify-between shadow-xl p-6`}
              >
                {/* SVG Background */}
                <div className="absolute inset-0 w-full h-full">
                  <Image
                    src={
                      hoveredCard === pack.id || pack.popular
                        ? SVG_BG_HOVER
                        : SVG_BG_TRANSPARENT
                    }
                    alt=""
                    fill
                    className="object-cover"
                    priority
                    draggable={false}
                  />
                  {/* Blur Overlay abu-abu */}
                  <div className="absolute inset-0 w-full h-full bg-gray-200 opacity-60 backdrop-blur-[4px] pointer-events-none"></div>
                </div>

                {/* Card Content */}
                <div className="relative z-10 p-4 flex flex-col h-full">
                  {/* Icon, Title, Desc, Price */}
                  <div className="flex flex-col items-start text-start min-h-[160px] md:min-h-[180px] lg:min-h-[200px]">
                    <div className="mb-4">
                      <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16">{getCrownIcon(pack.id)}</div>
                    </div>
                    <h3 className={`text-xl md:text-2xl font-bold mb-2 ${getTitleColor(pack.id)} text-color-text`}>{pack.name}</h3>
                    <p className="text-color-text mb-2 text-base md:text-lg">
                      {pack.description || "For large teams & corporations"}
                    </p>
                    <div className="mb-2">
                      <span className="text-2xl md:text-3xl font-bold text-color-text">
                        {pack.price === 0 ? "Free" : `IDR ${pack.price.toLocaleString()}`}
                      </span>
                      {pack.price > 0 && <span className="text-gray-400 text-base md:text-lg ml-2">/Per Month</span>}
                    </div>
                    <div className="mb-2">
                      <span className="text-base md:text-lg text-color-text font-semibold">
                        Tokens: {pack.tokens.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="border-b border-gray-600 my-3"></div>
                  {/* Features */}
                  <div className="flex flex-col flex-grow min-h-[220px]">
                    <h4 className="text-lg md:text-xl font-semibold mb-2 text-start text-color-text">Features</h4>
                    <ul className="space-y-2 relative">
                      {pack.features?.slice(0, expandedFeatures[pack.id] ? undefined : 4).map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-tertiary mr-2 flex-shrink-0 mt-1" />
                          <span className="text-base md:text-lg text-color-text">{feature}</span>
                        </li>
                      ))}
                      {!expandedFeatures[pack.id] && pack.features.length > 4 && (
                        <li className="absolute left-0 right-0 bottom-0 h-8 pointer-events-none bg-gray-200 opacity-100 backdrop-blur-[35px] rounded-b-2xl"></li>
                      )}
                    </ul>
                    {pack.features.length > 4 && (
                      <button
                        onClick={() => toggleFeatures(pack.id)}
                        className="mt-2 flex items-center text-color-text transition-colors mx-auto text-sm z-10 relative"
                      >
                        {expandedFeatures[pack.id] ? (
                          <>
                            <span>Show Less</span>
                            <ChevronUp className="ml-1 h-4 w-4" />
                          </>
                        ) : (
                          <>
                            <span>Show More</span>
                            <ChevronDown className="ml-1 h-4 w-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  {/* Button */}
                  <div className="mt-auto pt-6 flex justify-center">
                    <button
                      onClick={() => handleBuy(pack.id)}
                      className="w-full py-3 rounded-xl font-bold text-lg transition-colors duration-300 border-2 border-teal-500 bg-gradient-to-br from-quaternary to-tertiary text-white hover:opacity-90"
                    >
                      {pack.price === 0 ? "Get Started" : "Buy Now"}
                    </button>
                  </div>
                  <p className="text-center text-color-text mt-3 font-medium text-sm md:text-base">Limited Offer</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}