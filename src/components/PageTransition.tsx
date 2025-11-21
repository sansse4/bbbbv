import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("page-transition");

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage("page-exit");
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage("page-transition");
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

  return (
    <div key={displayLocation.pathname} className={transitionStage}>
      {children}
    </div>
  );
}
