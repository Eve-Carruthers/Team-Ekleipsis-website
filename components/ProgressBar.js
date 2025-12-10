import React, { useEffect, useRef } from "react";
const h = React.createElement;

export default function ProgressBar() {
  const fillRef = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(1, Math.max(0, window.scrollY / (max || 1)));
      if (fillRef.current) fillRef.current.style.width = `${progress * 100}%`;
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return h("div", { id: "progress-bar" }, h("div", { id: "progress-fill", ref: fillRef }));
}
