"use client"

import { ThemeProvider as NextThemesProvider } from "better-themes"
import { type ThemeProviderProps } from "better-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}