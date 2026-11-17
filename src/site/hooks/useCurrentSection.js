import { useEffect, useState } from 'react'

/**
 * Id of the section crossing the middle of the viewport (IntersectionObserver).
 * `ids` must be stable (module-level constant).
 */
const useCurrentSection = (ids) => {
  const [current, setCurrent] = useState(ids[0] ?? null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setCurrent(entry.target.id);
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);

  return current;
};

export default useCurrentSection
