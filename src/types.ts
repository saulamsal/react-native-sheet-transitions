import type { ViewStyle } from 'react-native'
import type { 
  WithSpringConfig,
  AnimatedStyleProp,
  ReduceMotion 
} from 'react-native-reanimated'

export type SpringConfig = WithSpringConfig

export interface DragDirections {
  toTop: boolean
  toBottom: boolean
  toLeft: boolean
  toRight: boolean
}

export type ResizeType = 'incremental' | 'decremental'

export interface SheetProviderProps {
  children: React.ReactNode
  springConfig?: SpringConfig
  resizeType?: ResizeType
}

export interface SheetScreenProps {
  children: React.ReactNode
  onClose: () => void
  scaleFactor?: number
  dragThreshold?: number
  springConfig?: SpringConfig
  dragDirections?: DragDirections
  style?: AnimatedStyleProp<ViewStyle>
  opacityOnGestureMove?: boolean
  containerRadiusSync?: boolean
  initialBorderRadius?: number
  disableSyncScaleOnDragDown?: boolean
  customBackground?: React.ReactNode
} 