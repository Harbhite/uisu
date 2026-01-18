import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface DecryptionTextProps {
  text: string;
  className?: string;
  speed?: number;
  revealSpeed?: number;
  parentClassName?: string;
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+-=[]{}|;:,.<>?';

export const DecryptionText = ({
    text,
    className = "",
    speed = 50,
    revealSpeed = 100,
    parentClassName = ""
}: DecryptionTextProps) => {
  const [displayText, setDisplayText] = useState(text.split('').map(() => ' '));
  const [isDone, setIsDone] = useState(false);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView || isDone) return;

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(prev => {
        return text.split('').map((char, index) => {
          if (index < iteration) {
            return text[index];
          }
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        });
      });

      if (iteration >= text.length) {
        setIsDone(true);
        clearInterval(interval);
      }

      iteration += 1 / (revealSpeed / speed);
    }, speed);

    return () => clearInterval(interval);
  }, [isInView, text, speed, revealSpeed, isDone]);

  return (
    <span ref={containerRef} className={parentClassName}>
        {displayText.map((char, i) => (
            <span key={i} className={className}>{char}</span>
        ))}
    </span>
  );
};
