import { useEffect, useState } from "react";

export default function useIsLargeScreen(breakpoint = 1024) {
  const [isLargeScreen, setIsLargeScreen] = useState(
    typeof window !== "undefined" ? window.innerWidth >= breakpoint : true,
  );

  useEffect(() => {
    const onResize = () => setIsLargeScreen(window.innerWidth >= breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return isLargeScreen;
}
