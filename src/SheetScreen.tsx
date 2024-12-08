import React, { useEffect, useRef, useCallback } from 'react'
import { Dimensions, StyleSheet, View, Platform } from 'react-native'
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  interpolate,
  Extrapolate,
  runOnJS,
  cancelAnimation
} from 'react-native-reanimated'
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import { useSheet } from './SheetProvider'
import type { SpringConfig, DragDirections } from './types'
import { ScrollHandler } from './ScrollHandler'

const SCREEN_HEIGHT = Dimensions.get('window').height
const SCREEN_WIDTH = Dimensions.get('window').width

interface Props {
  children: React.ReactNode 
  onClose: () => void
  scaleFactor?: number
  dragThreshold?: number
  springConfig?: SpringConfig
  dragDirections?: DragDirections
  isScrollable?: boolean
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

//  TODO; containerRadiusSync = true

export function SheetScreen({
  children,
  onClose,
  scaleFactor = 0.83,
  dragThreshold = 150,
  springConfig = {
    damping: 15,
    stiffness: 60,
    mass: 0.6,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
  dragDirections = {
    toTop: false,
    toBottom: true,
    toLeft: false,
    toRight: false
  },
  isScrollable = false,
  style,
  opacityOnGestureMove = false,
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
}: Props) {
  const { setScale, resizeType, enableForWeb } = useSheet()
  const translateY = useSharedValue(0)
  const translateX = useSharedValue(0)
  const opacity = useSharedValue(1)
  const borderRadius = useSharedValue(initialBorderRadius)
  const hasPassedThreshold = useSharedValue(false)
  const previousTranslation = useSharedValue(0)
  const isMounted = useSharedValue(true)
  const scrollState = useSharedValue({
    isAtTop: true,
    isAtBottom: false,
    scrollY: 0,
    velocity: 0
  })
  const isDragging = useSharedValue(false)

  const shouldEnableScale = Platform.OS === 'ios' && !disableRootScale

  useEffect(() => {
    return () => {
      isMounted.value = false
      cancelAnimation(translateY)
      cancelAnimation(translateX)
      cancelAnimation(opacity)
      cancelAnimation(borderRadius)
    }
  }, [])

  const updateScale = React.useCallback((newScale: number) => {
    if (Platform.OS === 'android' || !isMounted.value) {
      return
    }
    setScale(newScale)
  }, [setScale])

  useEffect(() => {
    if (!shouldEnableScale) {
      if (__DEV__) {
        console.log('Background scaling is disabled on Android and Web. Only available on iOS.')
      }
      return
    }

    const initialScale = resizeType === 'incremental' ? 1.15 : scaleFactor
    if (onOpenStart) onOpenStart()
    setScale(initialScale)
    setTimeout(() => {
      if (onOpenEnd) onOpenEnd()
    }, 300)
    return () => setScale(1)
  }, [scaleFactor, resizeType, shouldEnableScale])

  const effectiveDragDirections = React.useMemo(() => ({
    ...dragDirections,
    toTop: isScrollable ? scrollState.value.isAtBottom : dragDirections.toTop,
    toBottom: isScrollable ? scrollState.value.isAtTop : dragDirections.toBottom,
  }), [dragDirections, isScrollable, scrollState.value])

  const handleScrollStateChange = useCallback((state: {
    isAtTop: boolean
    isAtBottom: boolean
    scrollY: number
    velocity: number
  }) => {
    scrollState.value = state
  }, [])

  const panGesture = React.useMemo(
    () => Gesture.Pan()
      .onStart(() => {
        'worklet'
        if (!isMounted.value) return
        hasPassedThreshold.value = false
        
        if (scrollState.value.isAtTop) {
          isDragging.value = true
          translateY.value = 0
        }
      })
      .onUpdate((event) => {
        'worklet'
        if (!isMounted.value) return
        const { translationX, translationY } = event

        if ((scrollState.value.isAtTop || !isScrollable) && isDragging.value) {
          if ((effectiveDragDirections.toBottom && translationY > 0) || 
              (effectiveDragDirections.toTop && translationY < 0)) {
            translateY.value = translationY
          }
        }
        
        if (effectiveDragDirections.toRight || effectiveDragDirections.toLeft) {
          if ((effectiveDragDirections.toRight && translationX > 0) || 
              (effectiveDragDirections.toLeft && translationX < 0)) {
            translateX.value = translationX
          }
        }

        const translation = Math.max(
          effectiveDragDirections.toBottom || effectiveDragDirections.toTop ? Math.abs(translationY) : 0,
          effectiveDragDirections.toLeft || effectiveDragDirections.toRight ? Math.abs(translationX) : 0
        )
        
        const willClose = translation > dragThreshold

        if (willClose !== hasPassedThreshold.value) {
          hasPassedThreshold.value = willClose
          if (willClose) {
            if (onCloseStart) runOnJS(onCloseStart)()
          } else {
            if (onBelowThreshold) runOnJS(onBelowThreshold)()
          }
        }

        const progress = Math.min(translation / (effectiveDragDirections.toBottom ? SCREEN_HEIGHT : SCREEN_WIDTH), 1)
        
        if (!disableSyncScaleOnDragDown && shouldEnableScale) {
          const newScale = resizeType === 'incremental' 
            ? 1.15 - (progress * 0.15)
            : scaleFactor + (progress * (1 - scaleFactor))
          runOnJS(updateScale)(newScale)
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
        isDragging.value = false
        const { velocityX, velocityY, translationX, translationY } = event
        const velocity = Math.max(Math.abs(velocityX), Math.abs(velocityY))
        const translation = Math.max(Math.abs(translationX), Math.abs(translationY))
        
        const isClosingAllowed = (
          (translationY > 0 && effectiveDragDirections.toBottom) ||
          (translationY < 0 && effectiveDragDirections.toTop) ||
          (translationX > 0 && effectiveDragDirections.toRight) ||
          (translationX < 0 && effectiveDragDirections.toLeft)
        )

        const shouldClose = 
          isClosingAllowed && (
            translation > dragThreshold || 
            (velocity > 500 && translation > 50)
          )
        
        if (shouldClose) {
          const finalTranslation = effectiveDragDirections.toBottom ? SCREEN_HEIGHT : SCREEN_WIDTH
          translateY.value = withSpring(effectiveDragDirections.toBottom ? finalTranslation : 0, {
            velocity: velocityY,
            ...springConfig
          })
          translateX.value = withSpring(effectiveDragDirections.toRight ? finalTranslation : 0, {
            velocity: velocityX,
            ...springConfig
          })
          opacity.value = withSpring(0)
          borderRadius.value = withSpring(0)
          if (shouldEnableScale) {
            runOnJS(updateScale)(1)
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
            runOnJS(updateScale)(resizeType === 'incremental' ? 1.15 : scaleFactor)
          }
        }
      })
    , [effectiveDragDirections, isScrollable, scrollState]
  )

  const animatedStyle = useAnimatedStyle(() => {
    if (!isMounted.value) return {}
    
    const scale = disableSheetContentResizeOnDragDown ? 1 : interpolate(
      Math.max(Math.abs(translateY.value), Math.abs(translateX.value)),
      [0, effectiveDragDirections.toBottom ? SCREEN_HEIGHT : SCREEN_WIDTH],
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

  const renderContent = () => {
    if (!isScrollable) return children

    return (
      <ScrollHandler
        panGesture={panGesture}
        onScrollStateChange={handleScrollStateChange}
      >
        {children}
      </ScrollHandler>
    )
  }

  if (!enableForWeb) {
    return (
      <View style={StyleSheet.absoluteFill}>
        {customBackground && (
          <View style={StyleSheet.absoluteFill}>
            {customBackground}
          </View>
        )}
        <View style={[styles.container, style]}>
          {renderContent()}
        </View>
      </View>
    )
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      {customBackground && (
        <Animated.View style={backgroundStyle}>
          {customBackground}
        </Animated.View>
      )}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.container, style, animatedStyle]}>
          {renderContent()}
        </Animated.View>
      </GestureDetector>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden'
  }
}) 