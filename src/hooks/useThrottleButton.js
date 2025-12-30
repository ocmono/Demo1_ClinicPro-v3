import { useState, useCallback, useRef } from 'react';

const useThrottleClick = (options = {}) => {
    const {
        maxClicks = 3,
        disableDuration = 5000, // 5 seconds
        resetOnDisable = true
    } = options;

    const [clickCount, setClickCount] = useState(0);
    const [isDisabled, setIsDisabled] = useState(false);
    const timerRef = useRef(null);

    const resetThrottle = useCallback(() => {
        setClickCount(0);
        setIsDisabled(false);
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const handleClick = useCallback((callback) => {
        return (...args) => {
            if (isDisabled) return;

            const newCount = clickCount + 1;
            setClickCount(newCount);

            // Execute the callback function
            if (callback && typeof callback === 'function') {
                callback(...args);
            }

            // Disable button after max clicks
            if (newCount >= maxClicks) {
                setIsDisabled(true);
                
                // Auto reset after disable duration
                timerRef.current = setTimeout(() => {
                    if (resetOnDisable) {
                        resetThrottle();
                    } else {
                        setIsDisabled(false);
                    }
                }, disableDuration);
            }
        };
    }, [clickCount, isDisabled, maxClicks, disableDuration, resetOnDisable, resetThrottle]);

    return {
        clickCount,
        isDisabled,
        handleClick,
        resetThrottle,
        remainingClicks: Math.max(0, maxClicks - clickCount)
    };
};

export default useThrottleClick;