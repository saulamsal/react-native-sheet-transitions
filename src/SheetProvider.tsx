import React, { createContext, useContext, useState } from 'react'
import { Platform } from 'react-native'

interface SheetContextType {
  scale: number
  setScale: (scale: number) => void
  resizeType: 'incremental' | 'decremental'
  isWebEnabled: boolean
}

interface SheetProviderProps {
  children: React.ReactNode
  resizeType?: 'incremental' | 'decremental'
  enableForWeb?: boolean
}

const SheetContext = createContext<SheetContextType | null>(null)

export function SheetProvider({ 
  children, 
  resizeType = 'decremental',
  enableForWeb = false 
}: SheetProviderProps) {
  const [scale, setScale] = useState(1)
  const isWebEnabled = Platform.OS === 'web' ? enableForWeb : true

  if (Platform.OS === 'web' && enableForWeb && __DEV__) {
    console.warn(
      '[SheetProvider] Sheet transitions on web are not recommended for optimal UX. ' +
      'Consider using native web modals or dialogs for better accessibility and user experience.'
    )
  }

  return (
    <SheetContext.Provider value={{ 
      scale, 
      setScale, 
      resizeType,
      isWebEnabled 
    }}>
      <>{children}</>
    </SheetContext.Provider>
  )
}

export function useSheet() {
  const context = useContext(SheetContext)
  if (!context) {
    throw new Error('useSheet must be used within a SheetProvider')
  }
  return context
} 