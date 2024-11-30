import React, { useRef } from 'react'
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  runOnJS,
  WithSpringConfig,
} from 'react-native-reanimated'

interface ScrollState {
  isAtTop: boolean
  isAtBottom: boolean
  scrollY: number
  velocity: number
}

interface Props {
  children: React.ReactNode
  onScrollStateChange?: (state: ScrollState) => void
  panGesture: ReturnType<typeof Gesture.Pan>
  style?: any
}

export const ScrollHandler = React.forwardRef<Animated.ScrollView, Props>((props, ref) => {
  const { children, onScrollStateChange, panGesture, style } = props

  const scrollY = useSharedValue(0)
  const isScrolling = useSharedValue(false)
  const isDragging = useSharedValue(false)

  const handleScrollStateChange = (state: ScrollState) => {
    'worklet'
    if (onScrollStateChange) {
      runOnJS(onScrollStateChange)(state)
    }
  }

  const scrollGesture = Gesture.Native()
    .onBegin(() => {
      'worklet'
      isScrolling.value = true
      if (!isDragging.value) {
        handleScrollStateChange({
          isAtTop: scrollY.value <= 0,
          isAtBottom: false,
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
            handleScrollStateChange({
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