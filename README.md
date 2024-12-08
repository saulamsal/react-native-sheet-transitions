# React Native Sheet Transitions 🎭

Beautiful iOS-like sheet transitions for React Native, Expo Go, and Web. Provides smooth, native-feeling custom modal transitions with gesture-based interactions.

![Demo](assets/gifs/demo.gif)

## Features ✨

- 🔄 Smooth scale transitions
- 👆 Gesture-based dismissal with haptic feedback
- 📱 iOS-like modal animations
- 🎨 Customizable animations
- 🌗 Two animation modes: incremental & decremental
- 🎯 Border radius sync with gestures
- 🔍 Opacity animations
- 📐 Multi-directional dragging support


> ⚠️ **Work in Progress**: This package is under active development and not yet recommended for production use. Breaking changes may occur frequently. Feel free to contribute by submitting PRs or reporting issues!

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
| `enableForWeb` | `boolean` | `false` | Enable animations on web platform (not recommended) |

### SheetScreen Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onClose` | `() => void` | required | Callback when sheet is dismissed |
| `scaleFactor` | `number` | `0.83` | Scale factor for background content |
| `dragThreshold` | `number` | `150` | Distance required to trigger dismiss |
| `springConfig` | `SpringConfig` | `{ damping: 15, stiffness: 60, mass: 0.6, restDisplacementThreshold: 0.01, restSpeedThreshold: 0.01 }` | Spring animation config |
| `dragDirections` | `DragDirections` | `{ toBottom: true }` | Enabled drag directions |
| `isScrollable` | `boolean` | `false` | Enable scroll handling for content |
| `opacityOnGestureMove` | `boolean` | `false` | Enable opacity animation during drag |
| `containerRadiusSync` | `boolean` | `true` | Sync border radius with drag |
| `initialBorderRadius` | `number` | `50` | Initial border radius value |
| `style` | `ViewStyle` | undefined | Additional container styles |
| `disableSyncScaleOnDragDown` | `boolean` | `false` | Disable scale sync during drag |
| `customBackground` | `ReactNode` | undefined | Custom background component with fade animation |
| `onOpenStart` | `() => void` | undefined | Called when sheet starts opening animation |
| `onOpenEnd` | `() => void` | undefined | Called when sheet opening animation completes |
| `onCloseStart` | `() => void` | undefined | Called when user gesture triggers close |
| `onCloseEnd` | `() => void` | undefined | Called when close animation completes (replaces onClose if provided) |
| `onBelowThreshold` | `() => void` | undefined | Called when drag goes below threshold after exceeding it |
| `disableRootScale` | `boolean` | `false` | Disable background scaling effect |
| `disableSheetContentResizeOnDragDown` | `boolean` | `false` | Disable sheet content scaling during drag down |

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

### Custom Background

You can add a custom background component that fades in/out with the modal:

```tsx
import { BlurView } from 'expo-blur'

<SheetScreen 
  customBackground={
    <BlurView 
      intensity={20} 
      style={StyleSheet.absoluteFill}
    />
  }
  onClose={handleClose}
>
  <Content />
</SheetScreen>
```

The background component will:
- Fade in when modal opens
- Fade out when modal closes
- Be positioned absolutely behind the modal content
- Not sync opacity with drag gestures

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

## Contributing 🤝

Pull requests are welcome! For major changes:

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request


## Lifecycle Callbacks

The SheetScreen component provides several callbacks for precise control:

```typescript
interface SheetScreenProps {
  // Called when sheet starts opening animation
  onOpenStart?: () => void
  
  // Called when sheet opening animation completes
  onOpenEnd?: () => void
  
  // Called when user drags above threshold
  onCloseStart?: () => void
  
  // Called when user drags below threshold
  onBelowThreshold?: () => void
  
  // Called when close animation completes
  onCloseEnd?: () => void
}
```

### Example with Haptic Feedback

```typescript
<SheetScreen
  onCloseStart={() => {
    // Warn user they can release to close
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
  }}
  onBelowThreshold={() => {
    // Reset state when going below threshold
  }}
  onCloseEnd={() => {
    // Success haptic when sheet closes
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    router.back()
  }}
>
  {/* content */}
</SheetScreen>
```

## Platform Specific Behavior 📱

### Background Scaling

The background scaling effect (where the previous screen scales down when the sheet opens) is:
- ✅ Enabled by default on iOS
- ❌ Disabled by default on Android and Web
- Can be disabled on iOS using `disableRootScale={true}`

```tsx
<SheetScreen 
  disableRootScale={true}  // Disable background scaling even on iOS
  onClose={handleClose}
>
  <Content />
</SheetScreen>
```

## Web Platform Support ⚠️

By default, sheet transitions are disabled on web platforms for better UX and accessibility. Web modals should follow web platform conventions.

If you need to enable animations on web:

```tsx
<SheetProvider enableForWeb={true}>
  <App />
</SheetProvider>
```

> **Note**: Enabling sheet transitions on web is not recommended as it can:
> - Interfere with native web accessibility features
> - Create inconsistent UX across different browsers
> - Impact performance on lower-end devices
> - Break expected web modal behaviors
>
> Consider using native web modals or dialogs for better user experience on web platforms.

## Roadmap 🗺️

### High Priority
- [ ] Fix Scrolling gesture handling and momentum issues
- [ ] Multiple Portal support for nested sheets
- [ ] iOS-like sheet detents (snap points)
  - Configurable small, medium, large positions
  - Custom snap point values
  - Default snap point configuration
  - Smooth animations between detents
  - Gesture-based snapping behavior

### Plans
- [ ] Enhanced gesture controls
  - Velocity-based dismissal
  - Directional lock
- [ ] Accessibility improvements
  - Screen reader support
  - Reduced motion preferences
  - Focus support
- [ ] More animations
  - Shared element transitions
- [ ] Better web support
  - Keyboard navigation
  - Focus trapping


## License 📄

MIT © saulamsal