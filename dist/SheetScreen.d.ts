import React from 'react';
import type { SpringConfig, DragDirections } from './types';
interface Props {
    children: React.ReactNode;
    onClose: () => void;
    scaleFactor?: number;
    dragThreshold?: number;
    springConfig?: SpringConfig;
    dragDirections?: DragDirections;
    isScrollable?: boolean;
    style?: any;
    opacityOnGestureMove?: boolean;
    containerRadiusSync?: boolean;
    initialBorderRadius?: number;
    disableSyncScaleOnDragDown?: boolean;
    customBackground?: React.ReactNode;
    onOpenStart?: () => void;
    onOpenEnd?: () => void;
    onCloseStart?: () => void;
    onCloseEnd?: () => void;
    onBelowThreshold?: () => void;
    disableRootScale?: boolean;
    disableSheetContentResizeOnDragDown?: boolean;
}
export declare function SheetScreen({ children, onClose, scaleFactor, dragThreshold, springConfig, dragDirections, isScrollable, style, opacityOnGestureMove, containerRadiusSync, initialBorderRadius, disableSyncScaleOnDragDown, customBackground, onOpenStart, onOpenEnd, onCloseStart, onCloseEnd, onBelowThreshold, disableRootScale, disableSheetContentResizeOnDragDown, }: Props): React.JSX.Element;
export {};
