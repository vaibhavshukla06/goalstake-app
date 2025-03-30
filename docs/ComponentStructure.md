# GoalStake Component Structure Documentation

## Atomic Design Principles

The GoalStake app follows Atomic Design principles to organize components in a hierarchical structure that enhances maintainability and reusability. This methodology breaks down interfaces into fundamental building blocks and combines them to form increasingly complex components.

### Component Hierarchy

1. **Atoms**: Basic building blocks of the interface
2. **Molecules**: Simple compositions of atoms
3. **Organisms**: More complex UI components built from molecules and atoms
4. **Templates**: Page-level objects that place components into a layout
5. **Pages**: Specific instances of templates with real content

## Directory Structure

```
components/
├── atoms/           # Fundamental building blocks
│   ├── Button.tsx
│   ├── Card.tsx
│   └── ...
├── molecules/       # Combinations of atoms
│   ├── ChallengeCard.tsx
│   └── ...
├── organisms/       # Complex components
│   ├── ChallengeList.tsx
│   └── ...
├── templates/       # Page layouts
│   ├── DashboardTemplate.tsx
│   └── ...
├── SuspenseWrapper.tsx  # Utility components
├── ErrorBoundary.tsx
├── SkeletonLoader.tsx
└── index.ts         # Central export file
```

## Component Documentation

### Atoms

#### Button

```typescript
import { Button } from '@components/atoms/Button';

<Button
  title="Click Me"
  onPress={() => console.log('Clicked')}
  variant="primary" // 'primary' | 'secondary' | 'outline' | 'ghost'
  size="medium"     // 'small' | 'medium' | 'large'
  disabled={false}
  loading={false}
/>
```

#### Card

```typescript
import { Card } from '@components/atoms/Card';

<Card
  variant="default" // 'default' | 'outlined' | 'flat'
  elevation={2}
>
  {/* Content */}
</Card>
```

### Molecules

#### ChallengeCard

```typescript
import { ChallengeCard } from '@components/molecules/ChallengeCard';

<ChallengeCard
  challenge={challengeObject}
  onPress={() => console.log('View challenge')}
  showActions={true}
/>
```

### Organisms

#### ChallengeList

```typescript
import { ChallengeList } from '@components/organisms/ChallengeList';

<ChallengeList
  userId="user-123" // Optional: Filter challenges by user
  category="fitness" // Optional: Filter by category
/>
```

### Templates

#### DashboardTemplate

```typescript
import { DashboardTemplate } from '@components/templates/DashboardTemplate';

<DashboardTemplate
  header={<HeaderComponent />}
  footer={<FooterComponent />}
  userId="user-123"
  onRefresh={async () => {
    // Refresh data
  }}
/>
```

## Utility Components

### SuspenseWrapper

The `SuspenseWrapper` component combines React's Suspense with ErrorBoundary for graceful data loading and error handling.

```typescript
import { SuspenseWrapper } from '@components/SuspenseWrapper';

<SuspenseWrapper
  fallback={<LoadingComponent />} // Optional loading UI
  withErrorBoundary={true} // Optional: Can disable error boundary
>
  <ComponentWithSuspense />
</SuspenseWrapper>
```

### SkeletonLoader

The `SkeletonLoader` component provides loading placeholders for different UI elements.

```typescript
import SkeletonLoader from '@components/SkeletonLoader';

<SkeletonLoader
  type="challenge-list" // 'card' | 'list' | 'challenge-list' | 'profile'
  count={3} // Number of skeleton items to display
/>
```

## Best Practices

1. **Component Composition**: Prefer composition over inheritance. Build complex components by combining simpler ones.

2. **Prop Typing**: Always define TypeScript interfaces for component props.

3. **Performance Optimization**:
   - Use React.memo for components that render often but rarely change
   - Utilize useMemo and useCallback for expensive calculations and callbacks
   - Track rendering performance with performance monitoring tools

4. **State Management**:
   - Use local state for UI-only concerns
   - Use Zustand for global application state
   - Use React Query for server state

5. **Suspense & Error Handling**:
   - Wrap data-fetching components with SuspenseWrapper
   - Add appropriate fallback UIs for loading states
   - Always handle potential errors

## Adding New Components

When adding new components:

1. Place them in the appropriate atomic design category folder
2. Add TypeScript interfaces for props
3. Use existing atoms and molecules when possible
4. Add exports to the components/index.ts file
5. Document your component in this file
6. Add Storybook stories for the component

## Data Fetching Pattern

We use React Query with Suspense for data fetching. The pattern typically involves:

1. Creating a hook that returns query functions
2. Using the SuspenseWrapper component around data-fetching components
3. Implementing appropriate loading UIs and error states

```typescript
// Example pattern
function DataComponent() {
  const { data } = useQuery({
    queryKey: ['data'],
    queryFn: fetchData,
    suspense: true,
  });
  
  return <DisplayComponent data={data} />;
}

// Usage
<SuspenseWrapper fallback={<SkeletonLoader />}>
  <DataComponent />
</SuspenseWrapper>
``` 