import React from 'react';
import Animated from 'react-native-reanimated';
interface SheetContextType {
    scale: Animated.SharedValue<number>;
    setScale: (scale: number) => void;
    resizeType: 'incremental' | 'decremental';
    isWebEnabled: boolean;
}
interface SheetProviderProps {
    children: React.ReactNode;
    resizeType?: 'incremental' | 'decremental';
    enableForWeb?: boolean;
}
export declare function SheetProvider({ children, resizeType, enableForWeb }: SheetProviderProps): React.JSX.Element;
export declare function useSheet(): SheetContextType;
export {};
