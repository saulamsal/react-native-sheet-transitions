import React, { createContext, useContext, useCallback, useEffect } from 'react'
import { Platform, View } from 'react-native'
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  cancelAnimation,
  runOnJS
} from 'react-native-reanimated'

interface SheetContextType {
  scale: Animated.SharedValue<number>
  setScale: (scale: number) => void
  resizeType: 'incremental' | 'decremental'
  enableForWeb: boolean
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
  const scale = useSharedValue(1)
  const isMounted = useSharedValue(false)

  useEffect(() => {
    // Delay setting isMounted to ensure view is ready
    requestAnimationFrame(() => {
      isMounted.value = true
    })

    return () => {
      isMounted.value = false
      cancelAnimation(scale)
    }
  }, [])

  const setScale = useCallback((newScale: number) => {
    if (!isMounted.value) return

    if (Platform.OS === 'android') {
      scale.value = newScale
      return
    }

    scale.value = withSpring(newScale, {
      damping: 20,
      stiffness: 300,
      mass: 0.3,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    })
  }, [])

  const animatedStyle = useAnimatedStyle(() => {
    if (!isMounted.value) return {}

    return {
      transform: [{ scale: scale.value }],
    }
  }, [])

  const isEnabled = Platform.OS === 'web' ? enableForWeb : true

  return (
    <SheetContext.Provider value={{
      scale,
      setScale,
      resizeType,
      enableForWeb: isEnabled
    }}>
      {/* <View style={{ flex: 1, backgroundColor: 'red',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1
         }}/> */}

      <Animated.View
        style={[
          {
            flex: 1,
            backfaceVisibility: 'hidden',
          },
          Platform.OS === 'ios' ? animatedStyle : null
        ]}
        collapsable={false}
      >

        {children}

      </Animated.View>

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