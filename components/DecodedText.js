import React, { useState, useEffect, useRef } from 'react';

const h = React.createElement;

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+";

export default function DecodedText({ text, className = "", revealSpeed = 50, scrambleSpeed = 30 }) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);
  
  // Scramble function
  const scramble = () => {
    let iteration = 0;
    clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      setDisplayText(prev => 
        text
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return text[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );
      
      if (iteration >= text.length) {
        clearInterval(intervalRef.current);
      }
      
      iteration += 1/3; // Slower resolve than scramble
    }, scrambleSpeed);
  };

  // Run on mount
  useEffect(() => {
    scramble();
    return () => clearInterval(intervalRef.current);
  }, [text]);

  // Run on hover
  const handleMouseEnter = () => {
    setIsHovered(true);
    scramble();
  };

  return h("span", { 
    className: `${className} decoded-text`,
    onMouseEnter: handleMouseEnter,
    style: { display: 'inline-block', minWidth: '0.5em' } // Prevent layout shift
  }, displayText);
}

