import React, { useEffect, useRef } from 'react'
import { Dimensions, StyleSheet, View, Platform } from 'react-native'
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

interface SheetScreenProps {
  children: React.ReactNode
  onClose: () => void
  scaleFactor?: number
  dragThreshold?: number
  springConfig?: SpringConfig
  dragDirections?: DragDirections
  style?: any
  opacityOnGestureMove?: boolean
  containerRadiusSync?: boolean
  initialBorderRadius?: number
  disableSyncScaleOnDragDown?: boolean
  customBackground?: React.ReactNode
  onOpenStart?: () => void
  onOpenEnd?: () => void
  onCloseStart?: () => void
  onCloseEnd?: () => void
  onBelowThreshold?: () => void
  disableRootScale?: boolean
  disableSheetContentResizeOnDragDown?: boolean
}

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
    toTop: false,
    toBottom: true,
    toLeft: false,
    toRight: false
  },
  style,
  opacityOnGestureMove = false,
  containerRadiusSync = true,
  initialBorderRadius = 50,
  disableSyncScaleOnDragDown = false,
  customBackground,
  onOpenStart,
  onOpenEnd,
  onCloseStart,
  onCloseEnd = onClose,
  onBelowThreshold,
  disableRootScale = false,
  disableSheetContentResizeOnDragDown = false,
}: SheetScreenProps) {
  const { setScale, resizeType } = useSheet()
  const translateY = useSharedValue(0)
  const translateX = useSharedValue(0)
  const opacity = useSharedValue(1)
  const borderRadius = useSharedValue(initialBorderRadius)
  const hasPassedThreshold = useSharedValue(false)
  const previousTranslation = useSharedValue(0)

  const shouldEnableScale = Platform.OS === 'ios' && !disableRootScale

  useEffect(() => {
    if (!shouldEnableScale) {
      if (__DEV__) {
        console.log('Background scaling is disabled on Android and Web. Only available on iOS.')
      }
      return
    }

    const initialScale = resizeType === 'incremental' ? 1.15 : scaleFactor
    if (onOpenStart) runOnJS(onOpenStart)()
    setScale(initialScale)
    setTimeout(() => {
      if (onOpenEnd) onOpenEnd()
    }, 300)
    return () => setScale(1)
  }, [scaleFactor, resizeType, shouldEnableScale])

  const panGesture = React.useMemo(
    () => Gesture.Pan()
      .onStart(() => {
        'worklet'
        hasPassedThreshold.value = false
        previousTranslation.value = 0
      })
      .onUpdate((event) => {
        'worklet'
        const { translationX, translationY } = event

        if (dragDirections.toBottom || dragDirections.toTop) {
          translateY.value = dragDirections.toBottom && translationY > 0 ? translationY : 
                           dragDirections.toTop && translationY < 0 ? translationY : 0
        }
        if (dragDirections.toRight || dragDirections.toLeft) {
          translateX.value = dragDirections.toRight && translationX > 0 ? translationX :
                           dragDirections.toLeft && translationX < 0 ? translationX : 0
        }

        const translation = Math.max(Math.abs(translationY), Math.abs(translationX))
        const willClose = translation > dragThreshold

        if (willClose !== hasPassedThreshold.value) {
          hasPassedThreshold.value = willClose
          if (willClose) {
            if (onCloseStart) runOnJS(onCloseStart)()
          } else {
            if (onBelowThreshold) runOnJS(onBelowThreshold)()
          }
        }

        const progress = Math.min(translation / (dragDirections.toBottom ? SCREEN_HEIGHT : SCREEN_WIDTH), 1)
        
        if (!disableSyncScaleOnDragDown && shouldEnableScale) {
          setScale(resizeType === 'incremental' 
            ? 1.15 - (progress * 0.15)
            : scaleFactor + (progress * (1 - scaleFactor)))
        }

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
          const finalTranslation = dragDirections.toBottom ? SCREEN_HEIGHT : SCREEN_WIDTH
          translateY.value = withSpring(dragDirections.toBottom ? finalTranslation : 0, {
            velocity: velocityY,
            ...springConfig
          })
          translateX.value = withSpring(dragDirections.toRight ? finalTranslation : 0, {
            velocity: velocityX,
            ...springConfig
          })
          opacity.value = withSpring(0)
          borderRadius.value = withSpring(0)
          if (shouldEnableScale) {
            setScale(1)
          }
          runOnJS(onCloseEnd)()
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
          if (shouldEnableScale) {
            setScale(resizeType === 'incremental' ? 1.15 : scaleFactor)
          }
        }
      })
    , [dragDirections, dragThreshold, onCloseStart, onBelowThreshold, shouldEnableScale]
  )

  const animatedStyle = useAnimatedStyle(() => {
    const scale = disableSheetContentResizeOnDragDown ? 1 : interpolate(
      Math.max(Math.abs(translateY.value), Math.abs(translateX.value)),
      [0, dragDirections.toBottom ? SCREEN_HEIGHT : SCREEN_WIDTH],
      resizeType === 'incremental' ? [1.15, 1] : [1, 0.85],
      Extrapolate.CLAMP
    )
    
    return {
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { scale }
      ],
      opacity: opacity.value,
      borderRadius: borderRadius.value,
    }
  }, [disableSheetContentResizeOnDragDown])

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }))

  return (
    <View style={StyleSheet.absoluteFill}>
      {customBackground && (
        <Animated.View style={backgroundStyle}>
          {customBackground}
        </Animated.View>
      )}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.container, style, animatedStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  }
}) 