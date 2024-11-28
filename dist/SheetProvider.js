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
exports.useSheet = exports.SheetProvider = void 0;
const react_1 = __importStar(require("react"));
const react_native_reanimated_1 = require("react-native-reanimated");
const react_native_1 = require("react-native");
const react_native_reanimated_2 = __importStar(require("react-native-reanimated"));
const SheetContext = (0, react_1.createContext)(null);
function SheetProvider({ children, springConfig = {
    damping: 15,
    stiffness: 150,
    mass: 0.5,
}, resizeType = 'decremental' }) {
    const scale = (0, react_native_reanimated_1.useSharedValue)(1);
    const setScale = (value, config = springConfig) => {
        'worklet';
        scale.value = (0, react_native_reanimated_1.withSpring)(value, config);
    };
    const animatedStyle = (0, react_native_reanimated_2.useAnimatedStyle)(() => ({
        transform: [
            { scale: scale.value },
            { translateY: resizeType === 'incremental'
                    ? (1 - scale.value) * 150 // Move up when scaling up
                    : (1 - scale.value) * -150 // Move up when scaling down
            },
        ],
    }));
    return (<SheetContext.Provider value={{ scale, setScale, resizeType }}>
      <react_native_1.View style={styles.container}>
        <react_native_reanimated_2.default.View style={[styles.content, animatedStyle]}>
          {children}
        </react_native_reanimated_2.default.View>
      </react_native_1.View>
    </SheetContext.Provider>);
}
exports.SheetProvider = SheetProvider;
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    content: {
        flex: 1,
        overflow: 'hidden',
        borderRadius: 50,
    },
});
const useSheet = () => {
    const context = (0, react_1.useContext)(SheetContext);
    if (!context) {
        throw new Error('useSheet must be used within a SheetProvider');
    }
    return context;
};
exports.useSheet = useSheet;
