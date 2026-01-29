interface Step {
  label: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface StepperProps {
  steps: Step[];
  currentStep?: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  // If currentStep is provided, override status based on it
  const processedSteps = currentStep !== undefined
    ? steps.map((step, i) => ({
        ...step,
        status: i < currentStep ? 'completed' : i === currentStep ? 'current' : 'upcoming' as const,
      }))
    : steps;

  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="min-w-[600px] flex items-center justify-between relative px-4">
        {/* 배경 라인 */}
        <div className="absolute top-[15px] left-0 w-full h-[2px] bg-border -z-10" />

        {processedSteps.map((step, index) => (
          <div key={index} className="flex flex-col items-center gap-2 z-10">
            {/* 원형 인디케이터 */}
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center
                shadow-[0_0_0_4px_var(--bg-primary)]
                ${step.status === 'completed'
                  ? 'bg-primary text-background'
                  : step.status === 'current'
                    ? 'bg-primary text-background ring-4 ring-primary/30'
                    : 'bg-surface border-2 border-border text-text-secondary'
                }
              `}
            >
              {step.status === 'completed' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-sm font-bold">{index + 1}</span>
              )}
            </div>

            {/* 라벨 */}
            <span
              className={`
                text-xs font-medium whitespace-nowrap
                ${step.status === 'completed'
                  ? 'text-primary'
                  : step.status === 'current'
                    ? 'text-white font-bold'
                    : 'text-text-secondary'
                }
              `}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
