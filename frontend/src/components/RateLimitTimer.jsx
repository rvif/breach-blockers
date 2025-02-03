import { useState, useEffect } from "react";

export default function RateLimitTimer({ initialTime, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(Math.ceil(initialTime / 1000));

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  return (
    <div className="mt-2 text-sm">Please try again in {timeLeft} seconds</div>
  );
}
