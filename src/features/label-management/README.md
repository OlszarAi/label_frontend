# System Zarządzania Etykietami - Frontend

## Przegląd

System zarządzania etykietami po stronie frontendu zapewnia jednolity interfejs do tworzenia, duplikowania i zarządzania etykietami w aplikacji Label. System został zaprojektowany z myślą o eliminacji problemów z duplikatami i zapewnieniu spójnego UX.

## Architektura

### Struktura Folderów

```
src/features/label-management/
├── README.md                     # Ta dokumentacja
├── components/
│   ├── CreateLabelButton.tsx     # Główny komponent UI do tworzenia etykiet
│   └── index.ts                  # Re-export komponentów
├── hooks/
│   ├── useLabelManagement.ts     # React Hook do zarządzania etykietami
│   └── index.ts                  # Re-export hooków
├── services/
│   ├── labelManagementService.ts # Serwis komunikacji z API
│   └── index.ts                  # Re-export serwisów
└── index.ts                      # Główny re-export systemu
```

## Komponenty

### 1. CreateLabelButton (`components/CreateLabelButton.tsx`)

Uniwersalny komponent przycisku do tworzenia etykiet, który może być używany w całej aplikacji.

#### Props:

```typescript
interface CreateLabelButtonProps {
  projectId: string;                    // ID projektu (wymagane)
  variant?: 'primary' | 'secondary' | 'minimal' | 'fab';
  size?: 'sm' | 'md' | 'lg';
  navigateToEditor?: boolean;           // Czy nawigować do edytora po utworzeniu
  children?: React.ReactNode;           // Zawartość przycisku
  className?: string;                   // Dodatkowe klasy CSS
  onLabelCreated?: (label: Label) => void; // Callback po utworzeniu
  disabled?: boolean;                   // Czy przycisk jest wyłączony
}
```

#### Przykłady użycia:

```tsx
// Prosty przycisk tworzenia
<CreateLabelButton 
  projectId="project-123"
  variant="primary"
  size="md"
>
  Utwórz etykietę
</CreateLabelButton>

// Z nawigacją do edytora
<CreateLabelButton 
  projectId="project-123"
  navigateToEditor={true}
  onLabelCreated={(label) => console.log('Created:', label)}
>
  Nowa etykieta
</CreateLabelButton>

// Floating Action Button
<CreateLabelButton 
  projectId="project-123"
  variant="fab"
  className="fixed bottom-4 right-4"
/>
```

#### Warianty wizualne:

- **primary**: Główny niebieski przycisk
- **secondary**: Szary przycisk z obramowaniem
- **minimal**: Przezroczysty przycisk tylko z ikoną
- **fab**: Floating Action Button (okrągły)

### 2. useLabelManagement Hook (`hooks/useLabelManagement.ts`)

React Hook zapewniający kompletny interfejs do zarządzania etykietami.

#### Interfejs:

```typescript
interface UseLabelManagementOptions {
  projectId?: string;
  onLabelCreated?: (label: Label) => void;
  onLabelDuplicated?: (label: Label) => void;
  onError?: (error: string) => void;
}
```

#### Zwracane funkcje:

```typescript
const {
  // Tworzenie etykiet
  createLabel,                    // Tworzy etykietę bez nawigacji
  createLabelAndNavigate,         // Tworzy etykietę i nawiguje do edytora
  createFromTemplate,             // Tworzy z szablonu
  createBulkLabels,              // Tworzy wiele etykiet
  createSimpleLabel,             // Najprostsza metoda tworzenia

  // Duplikowanie
  duplicateLabel,                 // Duplikuje bez nawigacji
  duplicateLabelAndNavigate,      // Duplikuje i nawiguje

  // Stan
  isCreating,                     // Czy trwa tworzenie
  isDuplicating,                  // Czy trwa duplikowanie
} = useLabelManagement(options);
```

#### Przykład użycia:

```tsx
function MyComponent() {
  const {
    createLabel,
    createLabelAndNavigate,
    duplicateLabel,
    isCreating
  } = useLabelManagement({
    projectId: 'project-123',
    onLabelCreated: (label) => {
      toast.success(`Etykieta "${label.name}" została utworzona`);
    },
    onError: (error) => {
      toast.error(error);
    }
  });

  const handleCreateLabel = async () => {
    const label = await createLabel({
      width: 100,
      height: 50,
      description: 'My custom label'
    });
  };

  const handleCreateAndEdit = async () => {
    await createLabelAndNavigate({
      name: 'Custom Label Name'
    });
    // Automatycznie przekieruje użytkownika do edytora
  };

  return (
    <div>
      <button 
        onClick={handleCreateLabel}
        disabled={isCreating}
      >
        {isCreating ? 'Tworzenie...' : 'Utwórz etykietę'}
      </button>
      
      <button onClick={handleCreateAndEdit}>
        Utwórz i edytuj
      </button>
    </div>
  );
}
```

### 3. LabelManagementService (`services/labelManagementService.ts`)

Serwis komunikacji z backend API. Zapewnia low-level interfejs do wszystkich operacji na etykietach.

#### Główne metody:

```typescript
class LabelManagementService {
  // Tworzenie etykiet
  static async createLabel(projectId: string, data?: CreateLabelRequest): Promise<Label>;
  static async createSimpleLabel(projectId: string): Promise<Label>;
  static async createFromTemplate(projectId: string, template: TemplateRequest): Promise<Label>;
  static async createBulkLabels(projectId: string, count: number, baseData?: CreateLabelRequest): Promise<Label[]>;
  
  // Duplikowanie
  static async duplicateLabel(labelId: string): Promise<Label>;
  
  // Utility
  static async createLabelAndGetEditorUrl(projectId: string, data?: CreateLabelRequest): Promise<{ label: Label; editorUrl: string }>;
}
```

#### Przykład użycia:

```typescript
import { LabelManagementService } from '@/features/label-management';

// Tworzenie prostej etykiety
const label = await LabelManagementService.createSimpleLabel('project-123');

// Tworzenie z niestandardowymi parametrami
const customLabel = await LabelManagementService.createLabel('project-123', {
  name: 'My Label',
  width: 210,
  height: 297,
  description: 'A4 size label'
});

// Duplikowanie etykiety
const duplicated = await LabelManagementService.duplicateLabel('label-456');

// Masowe tworzenie
const bulkLabels = await LabelManagementService.createBulkLabels('project-123', 5, {
  width: 100,
  height: 50
});
```

## Integracja z Istniejącymi Komponentami

### Gallery Panel (Editor)

```tsx
import { CreateLabelButton } from '@/features/label-management';

function GalleryPanel({ currentLabel }) {
  return (
    <div className="gallery-panel">
      <CreateLabelButton
        projectId={currentLabel.projectId}
        variant="secondary"
        size="sm"
        onLabelCreated={(label) => {
          // Odśwież listę etykiet
          refreshLabels();
        }}
      >
        Nowa etykieta
      </CreateLabelButton>
      {/* Reszta komponentu */}
    </div>
  );
}
```

### Project Gallery

```tsx
import { CreateLabelButton } from '@/features/label-management';

function ImprovedLabelGallery({ projectId, onLabelCreated }) {
  return (
    <div className="label-gallery">
      <div className="gallery-header">
        <CreateLabelButton
          projectId={projectId}
          variant="primary"
          size="md"
          onLabelCreated={onLabelCreated}
        >
          <PlusIcon className="w-4 h-4" />
          Nowa etykieta
        </CreateLabelButton>
      </div>
      {/* Reszta galerii */}
    </div>
  );
}
```

## Obsługa Błędów

System automatycznie obsługuje błędy i wyświetla odpowiednie komunikaty:

```typescript
// W przypadku błędu, użytkownik zobaczy toast z komunikatem
const { createLabel } = useLabelManagement({
  onError: (error) => {
    // Możesz dodać własną logikę obsługi błędów
    console.error('Label creation failed:', error);
    // System automatycznie wyświetli też toast
  }
});
```

Standardowe komunikaty błędów:

- "Nie można utworzyć etykiety. Spróbuj ponownie."
- "Projekt nie został znaleziony."
- "Brak uprawnień do tego projektu."
- "Etykieta nie istnieje."

## Stylowanie

Komponenty używają CSS Modules i można je stylować poprzez:

1. **Przekazanie className**: `<CreateLabelButton className="my-custom-class" />`
2. **CSS Variables**: Komponenty respektują zmienne CSS dla kolorów i rozmiarów
3. **Warianty**: Wbudowane warianty zapewniają spójny wygląd

### Dostępne CSS Variables:

```css
:root {
  --label-button-primary-bg: #3b82f6;
  --label-button-primary-hover: #2563eb;
  --label-button-secondary-bg: #f3f4f6;
  --label-button-secondary-hover: #e5e7eb;
  --label-button-border-radius: 0.5rem;
  --label-button-transition: all 0.2s ease;
}
```

## Animacje

Komponenty używają Framer Motion dla płynnych animacji:

- Hover effects na przyciskach
- Loading states podczas tworzenia
- Smooth transitions między stanami

## Accessibility

System implementuje standardy dostępności:

- Właściwe role i aria-labels
- Keyboard navigation
- Screen reader support
- Focus management
- High contrast support

## Testowanie

```tsx
import { render, fireEvent, waitFor } from '@testing-library/react';
import { CreateLabelButton } from '@/features/label-management';

test('creates label when clicked', async () => {
  const onLabelCreated = jest.fn();
  
  render(
    <CreateLabelButton
      projectId="test-project"
      onLabelCreated={onLabelCreated}
    >
      Create Label
    </CreateLabelButton>
  );
  
  fireEvent.click(screen.getByText('Create Label'));
  
  await waitFor(() => {
    expect(onLabelCreated).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String)
      })
    );
  });
});
```

## Performance

System jest zoptymalizowany pod kątem wydajności:

- Lazy loading komponentów
- Memoization hooków React
- Debounced operations
- Efficient re-renders
- Code splitting

## Migracja ze Starego Systemu

### Przed migracją:

```tsx
// Stary sposób - rozproszony kod
function OldComponent() {
  const handleCreateLabel = async () => {
    try {
      const response = await fetch('/api/projects/123/labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Label' })
      });
      const label = await response.json();
      // Ręczne zarządzanie stanem, nawigacją, błędami...
    } catch (error) {
      // Ręczna obsługa błędów
    }
  };

  return <button onClick={handleCreateLabel}>Create</button>;
}
```

### Po migracji:

```tsx
// Nowy sposób - centralizowany system
function NewComponent() {
  return (
    <CreateLabelButton
      projectId="123"
      navigateToEditor={true}
      onLabelCreated={(label) => {
        // Automatyczna obsługa błędów, toastów, nawigacji
        console.log('Label created:', label);
      }}
    >
      Create
    </CreateLabelButton>
  );
}
```

## Debugowanie

### Włączenie debug mode:

```typescript
const { createLabel } = useLabelManagement({
  projectId: 'test-project',
  debug: true // Włączy szczegółowe logi w konsoli
});
```

### Dostępne narzędzia debugowania:

- Console logs dla wszystkich operacji
- Network monitoring w DevTools
- React DevTools dla hooków
- Error boundaries dla crash reporting

---

*Ostatnia aktualizacja: 23 lipca 2025*
