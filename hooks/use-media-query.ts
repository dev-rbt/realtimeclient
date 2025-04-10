import { useState, useEffect } from "react"

/**
 * Medya sorgusu için custom hook
 * @param query Medya sorgusu (örn. "(max-width: 768px)")
 * @returns Medya sorgusunun eşleşip eşleşmediği
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    
    // İlk değeri ayarla
    setMatches(mediaQuery.matches)
    
    // Değişiklikleri dinle
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }
    
    // Event listener ekle
    mediaQuery.addEventListener("change", handler)
    
    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handler)
    }
  }, [query])

  return matches
}
