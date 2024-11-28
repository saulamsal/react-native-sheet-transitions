# React Native Sheet Transitions 🎭

Beautiful iOS-like sheet transitions for React Native and Expo apps. Provides smooth, native-feeling modal transitions with gesture-based interactions.

## Features ✨

- 🔄 Smooth scale transitions
- 👆 Gesture-based dismissal
- 📱 iOS-like modal animations
- 🎨 Customizable animations
- 🌗 Two animation modes: incremental & decremental
- 🎯 Border radius sync with gestures
- 🔍 Opacity animations
- 📐 Multi-directional dragging support

## Installation 📦

```bash
npm install react-native-sheet-transitions
# or
yarn add react-native-sheet-transitions
# or
bun add react-native-sheet-transitions
```

### Peer Dependencies

```bash
npm install react-native-reanimated react-native-gesture-handler
```

## Basic Usage 🚀

1. Wrap your app with `SheetProvider`:

```tsx
import { SheetProvider } from 'react-native-sheet-transitions'

export default function App() {
  return (
    <SheetProvider>
      <Navigation />
    </SheetProvider>
  )
}
```

2. Use `SheetScreen` in your modal:

```tsx
import { SheetScreen } from 'react-native-sheet-transitions'

export default function ModalScreen() {
  const router = useRouter()
  
  return (
    <SheetScreen 
      onClose={() => router.back()}
      dragDirections={{ toBottom: true }}
      opacityOnGestureMove={true}
      containerRadiusSync={true}
    >
      <YourContent />
    </SheetScreen>
  )
}
```

## API Reference 📚

### SheetProvider Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `springConfig` | `SpringConfig` | `{ damping: 15, stiffness: 150, mass: 0.5 }` | Spring animation configuration |
| `resizeType` | `'incremental' \| 'decremental'` | `'decremental'` | Scale animation mode |

### SheetScreen Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onClose` | `() => void` | required | Callback when sheet is dismissed |
| `scaleFactor` | `number` | `0.83` | Scale factor for background content |
| `dragThreshold` | `number` | `150` | Distance required to trigger dismiss |
| `springConfig` | `SpringConfig` | `{ damping: 20, stiffness: 90, mass: 0.8 }` | Spring animation config |
| `dragDirections` | `DragDirections` | `{ toBottom: true }` | Enabled drag directions |
| `opacityOnGestureMove` | `boolean` | `false` | Enable opacity animation during drag |
| `containerRadiusSync` | `boolean` | `true` | Sync border radius with drag |
| `initialBorderRadius` | `number` | `50` | Initial border radius value |
| `style` | `ViewStyle` | undefined | Additional container styles |
| `disableSyncScaleOnDragDown` | `boolean` | `false` | Disable scale sync during drag |

### Types

```tsx
interface SpringConfig {
  damping?: number
  stiffness?: number
  mass?: number
  velocity?: number
}

interface DragDirections {
  toTop?: boolean
  toBottom?: boolean
  toLeft?: boolean
  toRight?: boolean
}
```

## Advanced Usage 🔧

### Incremental Scale Mode

Background scales up instead of down:

```tsx
<SheetProvider resizeType="incremental">
  <App />
</SheetProvider>
```

### Custom Animation Config

```tsx
<SheetScreen 
  springConfig={{
    damping: 15,
    stiffness: 120,
    mass: 0.8
  }}
  scaleFactor={0.85}
  dragThreshold={100}
  opacityOnGestureMove={true}
  containerRadiusSync={true}
  initialBorderRadius={40}
>
  <Content />
</SheetScreen>
```

### Multi-directional Dragging

```tsx
<SheetScreen 
  dragDirections={{
    toBottom: true,
    toLeft: true,
    toRight: true
  }}
  onClose={handleClose}
>
  <Content />
</SheetScreen>
```

## Expo Router Integration 🔗

Configure your modal screen:

```tsx
// app/_layout.tsx
import { Stack } from 'expo-router'
import { SheetProvider } from 'react-native-sheet-transitions'

export default function Layout() {
  return (
    <SheetProvider>
      <Stack>
        <Stack.Screen name="index" />
        <Stack.Screen 
          name="modal" 
          options={{
            presentation: 'transparentModal',
            contentStyle: { backgroundColor: 'transparent' }
          }}
        />
      </Stack>
    </SheetProvider>
  )
}
```

## Performance Tips 🚀

1. Use `memo` for complex modal content
2. Keep animations smooth by avoiding heavy computations during gestures
3. Use `useCallback` for event handlers
4. Consider using `worklet` functions for performance-critical animations

## Contributing 🤝

Pull requests are welcome! For major changes:

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License 📄

MIT © saulamsal
