/// <reference types="react" />
import type { ViewStyle } from 'react-native';
export interface SpringConfig {
    damping: number;
    stiffness: number;
    mass: number;
}
export interface DragDirections {
    toTop: boolean;
    toBottom: boolean;
    toLeft: boolean;
    toRight: boolean;
}
export type ResizeType = 'incremental' | 'decremental';
export interface SheetProviderProps {
    children: React.ReactNode;
    springConfig?: SpringConfig;
    resizeType?: ResizeType;
}
export interface SheetScreenProps {
    children: React.ReactNode;
    onClose: () => void;
    scaleFactor?: number;
    dragThreshold?: number;
    springConfig?: SpringConfig;
    dragDirections?: DragDirections;
    style?: ViewStyle;
    opacityOnGestureMove?: boolean;
    containerRadiusSync?: boolean;
    initialBorderRadius?: number;
    disableSyncScaleOnDragDown?: boolean;
    customBackground?: React.ReactNode;
}
