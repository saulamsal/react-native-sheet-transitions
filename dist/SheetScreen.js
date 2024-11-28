"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SheetScreen = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_reanimated_1 = __importStar(require("react-native-reanimated"));
const react_native_gesture_handler_1 = require("react-native-gesture-handler");
const SheetProvider_1 = require("./SheetProvider");
const SCREEN_HEIGHT = react_native_1.Dimensions.get('window').height;
const SCREEN_WIDTH = react_native_1.Dimensions.get('window').width;
function SheetScreen({ children, onClose, scaleFactor = 0.83, dragThreshold = 150, springConfig = {
    damping: 20,
    stiffness: 90,
    mass: 0.8,
}, dragDirections = {
    toTop: false,
    toBottom: true,
    toLeft: false,
    toRight: false
}, style, opacityOnGestureMove = false, containerRadiusSync = true, initialBorderRadius = 50, disableSyncScaleOnDragDown = false, customBackground, onOpenStart, onOpenEnd, onCloseStart, onCloseEnd = onClose, onBelowThreshold, disableRootScale = false, disableSheetContentResizeOnDragDown = false, }) {
    const { setScale, resizeType, isWebEnabled } = (0, SheetProvider_1.useSheet)();
    const translateY = (0, react_native_reanimated_1.useSharedValue)(0);
    const translateX = (0, react_native_reanimated_1.useSharedValue)(0);
    const opacity = (0, react_native_reanimated_1.useSharedValue)(1);
    const borderRadius = (0, react_native_reanimated_1.useSharedValue)(initialBorderRadius);
    const hasPassedThreshold = (0, react_native_reanimated_1.useSharedValue)(false);
    const previousTranslation = (0, react_native_reanimated_1.useSharedValue)(0);
    const shouldEnableScale = react_native_1.Platform.OS === 'ios' && !disableRootScale;
    (0, react_1.useEffect)(() => {
        if (!shouldEnableScale) {
            if (__DEV__) {
                console.log('Background scaling is disabled on Android and Web. Only available on iOS.');
            }
            return;
        }
        const initialScale = resizeType === 'incremental' ? 1.15 : scaleFactor;
        if (onOpenStart)
            (0, react_native_reanimated_1.runOnJS)(onOpenStart)();
        setScale(initialScale);
        setTimeout(() => {
            if (onOpenEnd)
                onOpenEnd();
        }, 300);
        return () => setScale(1);
    }, [scaleFactor, resizeType, shouldEnableScale]);
    const panGesture = react_1.default.useMemo(() => react_native_gesture_handler_1.Gesture.Pan()
        .onStart(() => {
        'worklet';
        hasPassedThreshold.value = false;
        previousTranslation.value = 0;
    })
        .onUpdate((event) => {
        'worklet';
        const { translationX, translationY } = event;
        if (dragDirections.toBottom || dragDirections.toTop) {
            translateY.value = dragDirections.toBottom && translationY > 0 ? translationY :
                dragDirections.toTop && translationY < 0 ? translationY : 0;
        }
        if (dragDirections.toRight || dragDirections.toLeft) {
            translateX.value = dragDirections.toRight && translationX > 0 ? translationX :
                dragDirections.toLeft && translationX < 0 ? translationX : 0;
        }
        const translation = Math.max(Math.abs(translationY), Math.abs(translationX));
        const willClose = translation > dragThreshold;
        if (willClose !== hasPassedThreshold.value) {
            hasPassedThreshold.value = willClose;
            if (willClose) {
                if (onCloseStart)
                    (0, react_native_reanimated_1.runOnJS)(onCloseStart)();
            }
            else {
                if (onBelowThreshold)
                    (0, react_native_reanimated_1.runOnJS)(onBelowThreshold)();
            }
        }
        const progress = Math.min(translation / (dragDirections.toBottom ? SCREEN_HEIGHT : SCREEN_WIDTH), 1);
        if (!disableSyncScaleOnDragDown && shouldEnableScale) {
            setScale(resizeType === 'incremental'
                ? 1.15 - (progress * 0.15)
                : scaleFactor + (progress * (1 - scaleFactor)));
        }
        if (opacityOnGestureMove) {
            opacity.value = (0, react_native_reanimated_1.interpolate)(progress * SCREEN_HEIGHT, [0, SCREEN_HEIGHT * 0.5], [1, 0.5], react_native_reanimated_1.Extrapolate.CLAMP);
        }
    })
        .onEnd((event) => {
        'worklet';
        const { velocityX, velocityY, translationX, translationY } = event;
        const velocity = Math.max(Math.abs(velocityX), Math.abs(velocityY));
        const translation = Math.max(Math.abs(translationX), Math.abs(translationY));
        const shouldClose = translation > dragThreshold ||
            (velocity > 500 && translation > 50);
        if (shouldClose) {
            const finalTranslation = dragDirections.toBottom ? SCREEN_HEIGHT : SCREEN_WIDTH;
            translateY.value = (0, react_native_reanimated_1.withSpring)(dragDirections.toBottom ? finalTranslation : 0, Object.assign({ velocity: velocityY }, springConfig));
            translateX.value = (0, react_native_reanimated_1.withSpring)(dragDirections.toRight ? finalTranslation : 0, Object.assign({ velocity: velocityX }, springConfig));
            opacity.value = (0, react_native_reanimated_1.withSpring)(0);
            borderRadius.value = (0, react_native_reanimated_1.withSpring)(0);
            if (shouldEnableScale) {
                setScale(1);
            }
            (0, react_native_reanimated_1.runOnJS)(onCloseEnd)();
        }
        else {
            translateY.value = (0, react_native_reanimated_1.withSpring)(0, Object.assign({ velocity: velocityY }, springConfig));
            translateX.value = (0, react_native_reanimated_1.withSpring)(0, Object.assign({ velocity: velocityX }, springConfig));
            opacity.value = (0, react_native_reanimated_1.withSpring)(1);
            borderRadius.value = (0, react_native_reanimated_1.withSpring)(initialBorderRadius);
            if (shouldEnableScale) {
                setScale(resizeType === 'incremental' ? 1.15 : scaleFactor);
            }
        }
    }), [dragDirections, dragThreshold, onCloseStart, onBelowThreshold, shouldEnableScale]);
    const animatedStyle = (0, react_native_reanimated_1.useAnimatedStyle)(() => {
        const scale = disableSheetContentResizeOnDragDown ? 1 : (0, react_native_reanimated_1.interpolate)(Math.max(Math.abs(translateY.value), Math.abs(translateX.value)), [0, dragDirections.toBottom ? SCREEN_HEIGHT : SCREEN_WIDTH], resizeType === 'incremental' ? [1.15, 1] : [1, 0.85], react_native_reanimated_1.Extrapolate.CLAMP);
        return {
            transform: [
                { translateY: translateY.value },
                { translateX: translateX.value },
                { scale }
            ],
            opacity: opacity.value,
            borderRadius: borderRadius.value,
        };
    }, [disableSheetContentResizeOnDragDown]);
    const backgroundStyle = (0, react_native_reanimated_1.useAnimatedStyle)(() => ({
        opacity: opacity.value,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    }));
    if (react_native_1.Platform.OS === 'web' && !isWebEnabled) {
        return (<react_native_1.View style={react_native_1.StyleSheet.absoluteFill}>
        {customBackground && (<react_native_1.View style={react_native_1.StyleSheet.absoluteFill}>
            {customBackground}
          </react_native_1.View>)}
        <react_native_1.View style={[styles.container, style]}>
          {children}
        </react_native_1.View>
      </react_native_1.View>);
    }
    return (<react_native_1.View style={react_native_1.StyleSheet.absoluteFill}>
      {customBackground && (<react_native_reanimated_1.default.View style={backgroundStyle}>
          {customBackground}
        </react_native_reanimated_1.default.View>)}
      <react_native_gesture_handler_1.GestureDetector gesture={panGesture}>
        <react_native_reanimated_1.default.View style={[styles.container, style, animatedStyle]}>
          {children}
        </react_native_reanimated_1.default.View>
      </react_native_gesture_handler_1.GestureDetector>
    </react_native_1.View>);
}
exports.SheetScreen = SheetScreen;
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    }
});
