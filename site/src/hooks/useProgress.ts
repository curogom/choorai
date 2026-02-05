import { useState, useEffect } from 'react';
import { calculateOverallProgress, calculateCurrentStep } from '../lib/progressStore';

export function useChallengeProgress() {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    // 초기 로드
    setProgress(calculateOverallProgress());
    setCurrentStep(calculateCurrentStep());

    // 같은 탭에서의 변경 감지 (커스텀 이벤트)
    const handleChange = () => {
      setProgress(calculateOverallProgress());
      setCurrentStep(calculateCurrentStep());
    };
    window.addEventListener('60min-progress-change', handleChange);

    // 다른 탭에서의 변경 감지 (storage 이벤트)
    const handleStorage = (e: StorageEvent) => {
      if (e.key?.startsWith('checklist-60min')) {
        setProgress(calculateOverallProgress());
        setCurrentStep(calculateCurrentStep());
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('60min-progress-change', handleChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return { progress, currentStep };
}
