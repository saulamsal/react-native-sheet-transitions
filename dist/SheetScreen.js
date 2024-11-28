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
    top: false,
    bottom: true,
    left: false,
    right: false
}, style, opacityOnGestureMove = false, containerRadiusSync = true, initialBorderRadius = 50, }) {
    const { setScale, resizeType } = (0, SheetProvider_1.useSheet)();
    const translateY = (0, react_native_reanimated_1.useSharedValue)(0);
    const translateX = (0, react_native_reanimated_1.useSharedValue)(0);
    const opacity = (0, react_native_reanimated_1.useSharedValue)(1);
    const borderRadius = (0, react_native_reanimated_1.useSharedValue)(initialBorderRadius);
    (0, react_1.useEffect)(() => {
        const initialScale = resizeType === 'incremental' ? 1.15 : scaleFactor;
        setScale(initialScale);
        return () => setScale(1);
    }, [scaleFactor, resizeType]);
    const animatedStyle = (0, react_native_reanimated_1.useAnimatedStyle)(() => {
        const scale = (0, react_native_reanimated_1.interpolate)(Math.max(Math.abs(translateY.value), Math.abs(translateX.value)), [0, dragDirections.bottom ? SCREEN_HEIGHT : SCREEN_WIDTH], resizeType === 'incremental'
            ? [1.15, 1] // Start big, scale down to normal
            : [1, 0.85], // Start normal, scale down
        react_native_reanimated_1.Extrapolate.CLAMP);
        // Calculate progress for border radius
        const progress = Math.min(Math.max(Math.abs(translateY.value), Math.abs(translateX.value)) /
            (dragDirections.bottom ? SCREEN_HEIGHT : SCREEN_WIDTH), 1);
        // Sync border radius with gesture if enabled
        if (containerRadiusSync) {
            borderRadius.value = (0, react_native_reanimated_1.interpolate)(progress, [0, 1], [initialBorderRadius, 0], react_native_reanimated_1.Extrapolate.CLAMP);
        }
        return {
            transform: [
                { translateY: dragDirections.bottom || dragDirections.top ? translateY.value : 0 },
                { translateX: dragDirections.left || dragDirections.right ? translateX.value : 0 },
                { scale }
            ],
            opacity: opacity.value,
            borderRadius: borderRadius.value,
        };
    });
    const panGesture = react_native_gesture_handler_1.Gesture.Pan()
        .onStart(() => {
        'worklet';
        if (!opacityOnGestureMove) {
            opacity.value = 1;
        }
    })
        .onUpdate((event) => {
        'worklet';
        const { translationX, translationY } = event;
        if (dragDirections.bottom && translationY > 0) {
            translateY.value = translationY;
        }
        else if (dragDirections.top && translationY < 0) {
            translateY.value = translationY;
        }
        if (dragDirections.right && translationX > 0) {
            translateX.value = translationX;
        }
        else if (dragDirections.left && translationX < 0) {
            translateX.value = translationX;
        }
        const progress = Math.min(Math.max(Math.abs(translationY), Math.abs(translationX)) /
            (dragDirections.bottom ? SCREEN_HEIGHT : SCREEN_WIDTH), 1);
        const newScale = resizeType === 'incremental'
            ? 1.15 - (progress * 0.15) // Start at 1.15, scale down to 1
            : scaleFactor + (progress * (1 - scaleFactor)); // Start at scaleFactor, scale up to 1
        setScale(newScale);
        // Update opacity based on gesture if enabled
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
            const finalTranslation = dragDirections.bottom ? SCREEN_HEIGHT : SCREEN_WIDTH;
            translateY.value = (0, react_native_reanimated_1.withSpring)(dragDirections.bottom ? finalTranslation : 0, Object.assign({ velocity: velocityY }, springConfig));
            translateX.value = (0, react_native_reanimated_1.withSpring)(dragDirections.right ? finalTranslation : 0, Object.assign({ velocity: velocityX }, springConfig));
            opacity.value = (0, react_native_reanimated_1.withSpring)(0);
            borderRadius.value = (0, react_native_reanimated_1.withSpring)(0);
            setScale(1);
            (0, react_native_reanimated_1.runOnJS)(onClose)();
        }
        else {
            translateY.value = (0, react_native_reanimated_1.withSpring)(0, Object.assign({ velocity: velocityY }, springConfig));
            translateX.value = (0, react_native_reanimated_1.withSpring)(0, Object.assign({ velocity: velocityX }, springConfig));
            opacity.value = (0, react_native_reanimated_1.withSpring)(1);
            borderRadius.value = (0, react_native_reanimated_1.withSpring)(initialBorderRadius);
            setScale(resizeType === 'incremental' ? 1.15 : scaleFactor);
        }
    });
    return (<react_native_gesture_handler_1.GestureDetector gesture={panGesture}>
      <react_native_reanimated_1.default.View style={[styles.container, style, animatedStyle]}>
        {children}
      </react_native_reanimated_1.default.View>
    </react_native_gesture_handler_1.GestureDetector>);
}
exports.SheetScreen = SheetScreen;
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    }
});
