import React, { createContext, useContext } from 'react'
import { SharedValue, useSharedValue, withSpring } from 'react-native-reanimated'
import type { SpringConfig, ResizeType } from './types'
import { StyleSheet, View } from 'react-native'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'

interface SheetContextType {
  scale: SharedValue<number>
  setScale: (value: number, config?: SpringConfig) => void
  resizeType: ResizeType
}

const SheetContext = createContext<SheetContextType | null>(null)

export interface SheetProviderProps {
  children: React.ReactNode
  springConfig?: SpringConfig
  resizeType?: ResizeType
}

export function SheetProvider({ 
  children, 
  springConfig = {
    damping: 15,
    stiffness: 150,
    mass: 0.5,
  },
  resizeType = 'decremental'
}: SheetProviderProps) {
  const scale = useSharedValue(1)

  const setScale = (value: number, config = springConfig) => {
    'worklet'
    scale.value = withSpring(value, config)
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: resizeType === 'incremental' 
          ? (1 - scale.value) * 150 // Move up when scaling up
          : (1 - scale.value) * -150 // Move up when scaling down
      },
    ],
  }))

  return (
    <SheetContext.Provider value={{ scale, setScale, resizeType }}>
      <View style={styles.container}>
        <Animated.View style={[styles.content, animatedStyle]}>
          {children}
        </Animated.View>
      </View>
    </SheetContext.Provider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 50,
  },
})

export const useSheet = () => {
  const context = useContext(SheetContext)
  if (!context) {
    throw new Error('useSheet must be used within a SheetProvider')
  }
  return context
} 