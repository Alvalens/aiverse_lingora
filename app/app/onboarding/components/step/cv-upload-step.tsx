"use client"

import type React from "react"
import { useRef, useState } from "react"
import { toast } from "react-hot-toast"
import StepNavigation from "../step-navigation"

interface CVUploadStepProps {
  selectedFile: File | null
  setSelectedFile: (file: File | null) => void
  onBack: () => void
  onContinue: () => void
}

export default function CVUploadStep({ selectedFile, setSelectedFile, onBack, onContinue }: CVUploadStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleContinue = async () => {
    if (!selectedFile) {
      onContinue()
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch("/api/cv/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload CV")
      }

      toast.success("CV uploaded successfully!")
      onContinue()
    } catch (error) {
      console.error("Error uploading CV:", error)
      toast.error("Failed to upload CV. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto text-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Upload Your CV (Optional)</h2>
      <p className="mb-6 text-center">Upload your CV to get personalized interview questions and feedback.</p>
      <div className="mb-8">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {selectedFile ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="ml-2 text-lg font-medium">{selectedFile.name}</span>
              </div>
              <p className="text-base text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              <button onClick={() => setSelectedFile(null)} className="text-red-500 text-base hover:text-red-700">
                Remove
              </button>
            </div>
          ) : (
            <>
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mt-2">Drag and drop your CV here, or</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Browse files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
              <p className="mt-2 text-base text-gray-300">Accepted formats: PDF, DOC, DOCX (max 5MB)</p>
            </>
          )}
        </div>
        <p className="text-base text-gray-300 mt-2">
          Note: This step is optional. You can always upload your CV later from your profile.
        </p>
      </div>

      <StepNavigation
        onBack={onBack}
        onContinue={handleContinue}
        isSubmitting={isSubmitting}
        continueText={selectedFile ? "Upload & Continue" : "Skip for now"}
      />
    </div>
  )
}
