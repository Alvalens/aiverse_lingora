interface ErrorMessageProps {
    message: string
  }
  
  export default function ErrorMessage({ message }: ErrorMessageProps) {
    if (!message) return null
  
    return <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{message}</div>
  }
  