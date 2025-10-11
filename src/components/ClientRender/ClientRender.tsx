"use client"

import { ReactNode, useEffect, useState } from "react"

// For preventing server-client hydration mismatch error

interface ClientRenderProps {
  children: ReactNode
}

function ClientRender({ children }: ClientRenderProps) {
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])
  return isMounted ? children : null
}

export default ClientRender
