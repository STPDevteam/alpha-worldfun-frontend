import { useEffect, useState } from 'react';

export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [isXlScreen, setIsXlScreen] = useState(true);
  const [is2XlScreen, setIs2XlScreen] = useState(true);
  const [isFirefox, setIsFirefox] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth <= 768; // Common mobile breakpoint
      const tablet = window.innerWidth > 768 && window.innerWidth <= 1024; // Tablet breakpoint
      const xlScreen = window.innerWidth > 1280; // Tab
      const xl2Screen = window.innerWidth > 1536; // Tab
      setIsMobile(mobile);
      setIsTablet(tablet);
      setIsDesktop(!mobile && !tablet);
      setIsXlScreen(xlScreen);
      setIs2XlScreen(xl2Screen);
    };

    const checkBrowser = () => {
      const userAgent = navigator.userAgent.toLowerCase();

      // Firefox detection
      const firefox = userAgent.includes('firefox');
      setIsFirefox(firefox);

      // Safari detection (desktop only)
      const safari =
        userAgent.includes('safari') &&
        !userAgent.includes('chrome') &&
        !userAgent.includes('chromium') &&
        !userAgent.includes('mobile'); // Exclude mobile Safari
      setIsSafari(safari);
    };

    // Check on mount
    checkDevice();
    checkBrowser();

    // Add resize listener
    window.addEventListener('resize', checkDevice);

    // Cleanup
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop,
    isFirefox,
    isSafari,
    isXlScreen,
    is2XlScreen,
  };
};