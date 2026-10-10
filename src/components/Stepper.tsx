import React from 'react';

export interface StepItem {
  id: string;
  title: string;
  description?: string;
}

export interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  className?: string;
  onStepClick?: (stepIndex: number) => void;
}

export function Stepper({ steps, currentStep, className = '', onStepClick }: StepperProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className={`w-full ${className}`}>
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.id}
              className={`flex w-full items-center ${
                isLast
                  ? ''
                  : `after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block ${
                      isCompleted
                        ? 'after:border-blue-600 dark:after:border-blue-500'
                        : 'after:border-slate-200 dark:after:border-slate-700'
                    }`
              } ${isLast ? 'w-auto' : ''}`}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full lg:h-10 lg:w-10 shrink-0 ${
                  isCompleted
                    ? 'bg-blue-600 text-white'
                    : isCurrent
                    ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-600 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-500'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                } ${
                  onStepClick
                    ? 'cursor-pointer hover:opacity-80 transition-opacity'
                    : ''
                }`}
                onClick={() => {
                  if (onStepClick) {
                    onStepClick(index);
                  }
                }}
                role={onStepClick ? 'button' : undefined}
                tabIndex={onStepClick ? 0 : -1}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`Step ${index + 1}: ${step.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (onStepClick) {
                      onStepClick(index);
                    }
                  }
                }}
              >
                {isCompleted ? (
                  <svg
                    className="w-4 h-4 lg:w-5 lg:h-5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 16 12"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M1 5.917 5.724 10.5 15 1.5"
                    />
                  </svg>
                ) : (
                  <span className="font-medium text-sm lg:text-base">{index + 1}</span>
                )}
              </div>
              <div className="hidden sm:block ml-3 mr-4 whitespace-nowrap">
                <h3
                  className={`font-medium ${
                    isCurrent || isCompleted
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {step.title}
                </h3>
                {step.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {step.description}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
