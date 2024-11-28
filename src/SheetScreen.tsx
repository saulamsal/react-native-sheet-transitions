import React, { useEffect } from 'react'
import { Dimensions, StyleSheet } from 'react-native'
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  interpolate,
  Extrapolate,
  runOnJS
} from 'react-native-reanimated'
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import { useSheet } from './SheetProvider'
import type { SheetScreenProps, SpringConfig, DragDirections } from './types'

const SCREEN_HEIGHT = Dimensions.get('window').height
const SCREEN_WIDTH = Dimensions.get('window').width

export function SheetScreen({
  children,
  onClose,
  scaleFactor = 0.83,
  dragThreshold = 150,
  springConfig = {
    damping: 20,
    stiffness: 90,
    mass: 0.8,
  },
  dragDirections = {
    top: false,
    bottom: true,
    left: false,
    right: false
  },
  style,
  opacityOnGestureMove = false,
  containerRadiusSync = true,
  initialBorderRadius = 50,
}: SheetScreenProps) {
  const { setScale, resizeType } = useSheet()
  const translateY = useSharedValue(0)
  const translateX = useSharedValue(0)
  const opacity = useSharedValue(1)
  const borderRadius = useSharedValue(initialBorderRadius)

  useEffect(() => {
    const initialScale = resizeType === 'incremental' ? 1.15 : scaleFactor
    setScale(initialScale)
    return () => setScale(1)
  }, [scaleFactor, resizeType])

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      Math.max(Math.abs(translateY.value), Math.abs(translateX.value)),
      [0, dragDirections.bottom ? SCREEN_HEIGHT : SCREEN_WIDTH],
      resizeType === 'incremental' 
        ? [1.15, 1] // Start big, scale down to normal
        : [1, 0.85], // Start normal, scale down
      Extrapolate.CLAMP
    )

    // Calculate progress for border radius
    const progress = Math.min(
      Math.max(Math.abs(translateY.value), Math.abs(translateX.value)) / 
      (dragDirections.bottom ? SCREEN_HEIGHT : SCREEN_WIDTH),
      1
    )
    
    // Sync border radius with gesture if enabled
    if (containerRadiusSync) {
      borderRadius.value = interpolate(
        progress,
        [0, 1],
        [initialBorderRadius, 0],
        Extrapolate.CLAMP
      )
    }
    
    return {
      transform: [
        { translateY: dragDirections.bottom || dragDirections.top ? translateY.value : 0 },
        { translateX: dragDirections.left || dragDirections.right ? translateX.value : 0 },
        { scale }
      ],
      opacity: opacity.value,
      borderRadius: borderRadius.value,
    }
  })

  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet'
      if (!opacityOnGestureMove) {
        opacity.value = 1
      }
    })
    .onUpdate((event) => {
      'worklet'
      const { translationX, translationY } = event

      if (dragDirections.bottom && translationY > 0) {
        translateY.value = translationY
      } else if (dragDirections.top && translationY < 0) {
        translateY.value = translationY
      }

      if (dragDirections.right && translationX > 0) {
        translateX.value = translationX
      } else if (dragDirections.left && translationX < 0) {
        translateX.value = translationX
      }

      const progress = Math.min(
        Math.max(Math.abs(translationY), Math.abs(translationX)) / 
        (dragDirections.bottom ? SCREEN_HEIGHT : SCREEN_WIDTH),
        1
      )
      
      const newScale = resizeType === 'incremental' 
        ? 1.15 - (progress * 0.15) // Start at 1.15, scale down to 1
        : scaleFactor + (progress * (1 - scaleFactor)) // Start at scaleFactor, scale up to 1
      
      setScale(newScale)

      // Update opacity based on gesture if enabled
      if (opacityOnGestureMove) {
        opacity.value = interpolate(
          progress * SCREEN_HEIGHT,
          [0, SCREEN_HEIGHT * 0.5],
          [1, 0.5],
          Extrapolate.CLAMP
        )
      }
    })
    .onEnd((event) => {
      'worklet'
      const { velocityX, velocityY, translationX, translationY } = event
      const velocity = Math.max(Math.abs(velocityX), Math.abs(velocityY))
      const translation = Math.max(Math.abs(translationX), Math.abs(translationY))
      
      const shouldClose = 
        translation > dragThreshold || 
        (velocity > 500 && translation > 50)
      
      if (shouldClose) {
        const finalTranslation = dragDirections.bottom ? SCREEN_HEIGHT : SCREEN_WIDTH
        translateY.value = withSpring(dragDirections.bottom ? finalTranslation : 0, {
          velocity: velocityY,
          ...springConfig
        })
        translateX.value = withSpring(dragDirections.right ? finalTranslation : 0, {
          velocity: velocityX,
          ...springConfig
        })
        opacity.value = withSpring(0)
        borderRadius.value = withSpring(0)
        setScale(1)
        runOnJS(onClose)()
      } else {
        translateY.value = withSpring(0, {
          velocity: velocityY,
          ...springConfig
        })
        translateX.value = withSpring(0, {
          velocity: velocityX,
          ...springConfig
        })
        opacity.value = withSpring(1)
        borderRadius.value = withSpring(initialBorderRadius)
        setScale(resizeType === 'incremental' ? 1.15 : scaleFactor)
      }
    })

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, style, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  }
}) 