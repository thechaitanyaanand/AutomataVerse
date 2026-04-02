import { useEffect, useRef } from 'react';
import katex from 'katex';

export default function MathDisplay({ math, block = false, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && math) {
      try {
        katex.render(math, ref.current, {
          displayMode: block,
          throwOnError: false,
          trust: true,
          output: 'html',
        });
      } catch {
        if (ref.current) ref.current.textContent = math;
      }
    }
  }, [math, block]);

  return block
    ? <div ref={ref} className={`my-4 text-center overflow-x-auto ${className}`} />
    : <span ref={ref} className={`inline-block ${className}`} />;
}
