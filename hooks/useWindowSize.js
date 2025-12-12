import { useState, useEffect } from "react";
import { debounce } from "lodash";

export const useWindowSize = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    const debouncedResize = debounce(checkMobile, 200);
    window.addEventListener("resize", debouncedResize, { passive: true });
    return () => {
      debouncedResize.cancel();
      window.removeEventListener("resize", debouncedResize);
    };
  }, []);

  return isMobile;
};
