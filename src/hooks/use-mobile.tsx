
import * as React from "react"
import logger from "@/utils/logger"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

// Storage keys for caching detection results
const MOBILE_DETECTION_CACHE_KEY = 'math_game_mobile_detection';
const TABLET_DETECTION_CACHE_KEY = 'math_game_tablet_detection';

// Helper function to check if device is mobile based on user agent
function isMobileUserAgent() {
  if (typeof navigator === 'undefined') return false;
  
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || '';
  return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(ua) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0, 4));
}

// Helper function to check if device is tablet based on user agent
function isTabletUserAgent() {
  if (typeof navigator === 'undefined') return false;
  
  const ua = navigator.userAgent || '';
  return /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(ua.toLowerCase());
}

// Try to get cached detection first, if available
const getCachedDetection = (key: string): boolean | null => {
  try {
    const cached = sessionStorage.getItem(key);
    return cached ? JSON.parse(cached) : null;
  } catch (e) {
    return null;
  }
};

// Save detection to session storage to avoid redundant checks
const cacheDetection = (key: string, value: boolean): void => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Silently fail if sessionStorage is not available
  }
};

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(() => {
    // Check cache first
    const cached = getCachedDetection(MOBILE_DETECTION_CACHE_KEY);
    if (cached !== null) return cached;
    
    // Fall back to initial detection
    return typeof window !== 'undefined' ? isMobileUserAgent() : undefined;
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      // Prioritize user agent detection and only use screen width as a fallback
      const detected = isMobileUserAgent() || 
                      (window.innerWidth < MOBILE_BREAKPOINT && !window.matchMedia('(pointer: fine)').matches);
      
      setIsMobile(detected);
      cacheDetection(MOBILE_DETECTION_CACHE_KEY, detected);
    };
    
    // Set initial value if it wasn't set from cache
    if (isMobile === undefined) {
      handleResize();
    }
    
    // Log detection once for debugging - only in development
    const detectionData = {
      userAgent: isMobileUserAgent() ? 'Mobile user agent detected' : 'Desktop user agent detected',
      screenSize: window.innerWidth < MOBILE_BREAKPOINT ? 'Small screen width' : 'Large screen width',
      pointer: window.matchMedia('(pointer: fine)').matches ? 'Fine pointer (mouse) detected' : 'No fine pointer (touch)'
    };
    
    // Pass this object directly to logger.debug - it now accepts objects
    logger.debug(detectionData);
    
    // Add event listener
    window.addEventListener("resize", handleResize);
    
    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Default to false if SSR
  return isMobile === undefined ? false : isMobile;
}

// Enhanced hook for detecting mobile or tablet
export function useIsMobileOrTablet() {
  const [isMobileOrTablet, setIsMobileOrTablet] = React.useState<boolean | undefined>(() => {
    // Check cache first
    const cached = getCachedDetection(TABLET_DETECTION_CACHE_KEY);
    if (cached !== null) return cached;
    
    // Fall back to initial detection
    return typeof window !== 'undefined' ? (isMobileUserAgent() || isTabletUserAgent()) : undefined;
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      // Prioritize user agent detection and use pointer detection as a secondary signal
      const byUserAgent = isMobileUserAgent() || isTabletUserAgent();
      const byPointer = !window.matchMedia('(pointer: fine)').matches;
      const byWidth = window.innerWidth < TABLET_BREAKPOINT;
      
      // If user agent detects mobile/tablet OR (small screen AND no mouse), consider it mobile/tablet
      const detected = byUserAgent || (byWidth && byPointer);
      setIsMobileOrTablet(detected);
      cacheDetection(TABLET_DETECTION_CACHE_KEY, detected);
      
      // Log detection details once - only in development
      const detectionData = {
        userAgent: byUserAgent ? 'Mobile/tablet user agent detected' : 'Desktop user agent detected',
        screenSize: byWidth ? 'Small/medium screen width' : 'Large screen width',
        pointer: byPointer ? 'No fine pointer (likely touch)' : 'Fine pointer (mouse) detected'
      };
      
      // Pass object directly to logger.debug
      logger.debug(detectionData);
    };
    
    // Set initial value if it wasn't set from cache
    if (isMobileOrTablet === undefined) {
      handleResize();
    }
    
    // Add event listener
    window.addEventListener("resize", handleResize);
    
    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Default to false if SSR
  return isMobileOrTablet === undefined ? false : isMobileOrTablet;
}
