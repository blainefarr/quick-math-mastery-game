
import * as React from "react"

const COMPACT_HEIGHT_THRESHOLD = 650

export function useCompactHeight() {
  const [isCompactHeight, setIsCompactHeight] = React.useState<boolean>(false)

  React.useEffect(() => {
    const checkHeight = () => {
      setIsCompactHeight(window.innerHeight < COMPACT_HEIGHT_THRESHOLD)
    }

    const mql = window.matchMedia(`(max-height: ${COMPACT_HEIGHT_THRESHOLD - 1}px)`)
    mql.addEventListener("change", checkHeight)
    checkHeight() // Initial check
    
    return () => mql.removeEventListener("change", checkHeight)
  }, [])

  return isCompactHeight
}
