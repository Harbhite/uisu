import { useCallback } from 'react';

type HapticIntensity = 'light' | 'medium' | 'heavy';

/**
 * Custom hook for triggering haptic feedback on supported devices
 * Falls back gracefully on devices without Vibration API support
 */
export const useHapticFeedback = () => {
  const vibrate = useCallback((pattern: number | number[]) => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Silently fail if vibration not supported
      }
    }
  }, []);

  const triggerHaptic = useCallback((intensity: HapticIntensity = 'light') => {
    const patterns: Record<HapticIntensity, number> = {
      light: 10,
      medium: 25,
      heavy: 50,
    };
    vibrate(patterns[intensity]);
  }, [vibrate]);

  const triggerHoverFeedback = useCallback(() => {
    triggerHaptic('light');
  }, [triggerHaptic]);

  const triggerClickFeedback = useCallback(() => {
    triggerHaptic('medium');
  }, [triggerHaptic]);

  const triggerSuccessFeedback = useCallback(() => {
    vibrate([20, 50, 20]);
  }, [vibrate]);

  return {
    triggerHaptic,
    triggerHoverFeedback,
    triggerClickFeedback,
    triggerSuccessFeedback,
  };
};
