import React, { useRef } from 'react'
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated'

interface Props {
  children: React.ReactNode
  onScrollStateChange?: (state: {
    isAtTop: boolean
    isAtBottom: boolean
    scrollY: number
    velocity: number
  }) => void
  panGesture: Gesture
  style?: any
}

export const ScrollHandler = React.forwardRef<Animated.ScrollView, Props>((props, ref) => {
  const { children, onScrollStateChange, panGesture, style } = props

  const scrollY = useSharedValue(0)
  const isScrolling = useSharedValue(false)
  const isDragging = useSharedValue(false)

  const scrollGesture = Gesture.Native()
    .onBegin(() => {
      'worklet'
      isScrolling.value = true
      if (!isDragging.value) {
        runOnJS(onScrollStateChange)?.({
          isAtTop: scrollY.value <= 0,
          isAtBottom: false, // We'll calculate this properly
          scrollY: scrollY.value,
          velocity: 0
        })
      }
    })
    .onEnd(() => {
      'worklet'
      isScrolling.value = false
    })

  const composedGestures = Gesture.Simultaneous(panGesture, scrollGesture)

  return (
    <GestureDetector gesture={composedGestures}>
      <Animated.ScrollView
        ref={ref}
        style={style}
        scrollEventThrottle={16}
        onScroll={(event) => {
          'worklet'
          const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent
          scrollY.value = contentOffset.y
          
          if (!isDragging.value) {
            runOnJS(onScrollStateChange)?.({
              isAtTop: contentOffset.y <= 0,
              isAtBottom: contentOffset.y >= (contentSize.height - layoutMeasurement.height),
              scrollY: contentOffset.y,
              velocity: 0
            })
          }
        }}
        bounces={false}
      >
        {children}
      </Animated.ScrollView>
    </GestureDetector>
  )
}) 