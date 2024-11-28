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
const react_native_1 = require("react-native");
const SheetContext = (0, react_1.createContext)(null);
function SheetProvider({ children, resizeType = 'decremental', enableForWeb = false }) {
    const [scale, setScale] = (0, react_1.useState)(1);
    const isWebEnabled = react_native_1.Platform.OS === 'web' ? enableForWeb : true;
    if (react_native_1.Platform.OS === 'web' && enableForWeb && __DEV__) {
        console.warn('[SheetProvider] Sheet transitions on web are not recommended for optimal UX. ' +
            'Consider using native web modals or dialogs for better accessibility and user experience.');
    }
    return (<SheetContext.Provider value={{
            scale,
            setScale,
            resizeType,
            isWebEnabled
        }}>
      <>{children}</>
    </SheetContext.Provider>);
}
exports.SheetProvider = SheetProvider;
function useSheet() {
    const context = (0, react_1.useContext)(SheetContext);
    if (!context) {
        throw new Error('useSheet must be used within a SheetProvider');
    }
    return context;
}
exports.useSheet = useSheet;
