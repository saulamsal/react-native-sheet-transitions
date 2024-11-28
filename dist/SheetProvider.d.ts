import React from 'react';
import { SharedValue } from 'react-native-reanimated';
import type { SpringConfig, ResizeType } from './types';
interface SheetContextType {
    scale: SharedValue<number>;
    setScale: (value: number, config?: SpringConfig) => void;
    resizeType: ResizeType;
}
export interface SheetProviderProps {
    children: React.ReactNode;
    springConfig?: SpringConfig;
    resizeType?: ResizeType;
}
export declare function SheetProvider({ children, springConfig, resizeType }: SheetProviderProps): React.JSX.Element;
export declare const useSheet: () => SheetContextType;
export {};
