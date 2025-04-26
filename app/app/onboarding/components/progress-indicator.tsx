interface ProgressIndicatorProps {
    currentStep: number;
    steps: string[];
  }
  
  export default function ProgressIndicator({
    currentStep,
    steps,
  }: ProgressIndicatorProps) {
    return (
      <div className="max-w-3xl mx-auto mb-12">
        <div className="relative py-6">
          <div className="absolute top-12 left-6 right-6 h-1 bg-gray-500 rounded-full transform -translate-y-1/2 z-0">
            <div
              className="absolute h-1 bg-tertiary rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
          <div className="relative flex justify-between items-center z-10">
            {steps.map((label, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    index < currentStep
                      ? "bg-tertiary text-white"
                      : index === currentStep
                      ? "bg-primary text-color-text border-2 border-tertiary"
                      : "bg-primary text-color-text border-2 border-gray-500"
                  }`}
                >
                  {index < currentStep ? (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span className="text-lg font-bold">{index + 1}</span>
                  )}
                </div>
  
                <span
                  className={`text-base hidden sm:block ${
                    index < currentStep
                      ? "text-tertiary" 
                      : index === currentStep
                      ? "text-color-text"
                      : "text-gray-300"
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  