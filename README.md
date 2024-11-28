# React Native Sheet Transitions

Native-feeling sheet transitions for React Native, powered by Reanimated 3.

## Installation

```bash
npm install react-native-sheet-transitions
```

Required peer dependencies:

```bash
npm install react-native-reanimated react-native-gesture-handler
```

## Usage

```tsx
import { SheetProvider, SheetScreen } from 'react-native-sheet-transitions'

// Wrap app with provider
function App() {
  return (
    <SheetProvider>
      <Navigation />
    </SheetProvider>
  )
}

// Use in modal screens
function ModalScreen() {
  return (
    <SheetScreen
      onClose={() => navigation.goBack()}
      dragDirections={{
        toBottom: true,
        toTop: false,
        toLeft: false,
        toRight: false
      }}
    >
      <Content />
    </SheetScreen>
  )
}
```

## API

### SheetProvider

```tsx
interface SheetProviderProps {
  springConfig?: SpringConfig // Animation config
  resizeType?: 'incremental' | 'decremental' // Scale direction
}
```

### SheetScreen

```tsx
interface SheetScreenProps {
  onClose: () => void // Dismiss callback
  scaleFactor?: number // Background scale (default: 0.83)
  dragThreshold?: number // Dismiss threshold (default: 150)
  springConfig?: SpringConfig // Animation config
  dragDirections?: DragDirections // Enabled directions
  opacityOnGestureMove?: boolean // Fade while dragging
  containerRadiusSync?: boolean // Sync radius with gesture
  initialBorderRadius?: number // Starting radius
  style?: ViewStyle // Container styles
}

interface DragDirections {
  toTop: boolean
  toBottom: boolean  
  toLeft: boolean
  toRight: boolean
}

interface SpringConfig {
  damping: number
  stiffness: number
  mass: number
}
```

## Examples

### Basic Modal

```tsx
<SheetScreen onClose={handleClose}>
  <Content />
</SheetScreen>
```

### Custom Animation

```tsx
<SheetScreen
  springConfig={{
    damping: 15,
    stiffness: 120,
    mass: 0.8
  }}
  scaleFactor={0.85}
  dragThreshold={100}
>
  <Content />
</SheetScreen>
```

### Multi-Direction

```tsx
<SheetScreen
  dragDirections={{
    toTop: true,
    toBottom: true,
    toLeft: true,
    toRight: true
  }}
  onClose={handleClose}
>
  <Content />
</SheetScreen>
```

## License

MIT