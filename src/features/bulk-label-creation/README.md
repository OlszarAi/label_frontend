# 🏭 Bulk Label Creation System

Zaawansowany system masowego tworzenia etykiet umożliwiający tworzenie dziesiątek tysięcy etykiet na podstawie jednego projektu.

## 🚀 Funkcjonalności

### ✨ Główne możliwości
- **Wybór szablonu** - Gotowe szablony + szablony użytkownika
- **Edytor modalny** - Pełny edytor etykiet w modalu wykorzystujący komponenty z `@label-editor`
- **Masowe tworzenie** - Do 10,000 etykiet naraz
- **Unikalne identyfikatory** - Automatyczne generowanie UUID dla każdej etykiety
- **Kody QR** - Automatyczne tworzenie unikalnych kodów QR z bazowym URL
- **Zaawansowane nazewnictwo** - Inteligentne numerowanie etykiet

### 🔧 Architektura

#### Frontend (`/src/features/bulk-label-creation/`)
```
components/
├── BulkLabelCreationModal.tsx    # Główny workflow modal
├── BulkLabelEditor.tsx           # Edytor wykorzystujący @label-editor
├── QuantitySelectionModal.tsx    # Wybór ilości i opcji
└── TemplateSelectionModal.tsx    # Wybór szablonów

hooks/
└── useBulkLabelCreation.ts       # Hook zarządzający stanem

services/
└── BulkLabelService.ts           # API communication

types/
└── bulk-label.types.ts           # TypeScript types
```

#### Backend (`/src/controllers/label-management.controller.ts`)
- Rozszerzony endpoint `createBulkLabels`
- Obsługa unikalnych UUID i QR kodów
- Support dla fabricData z obiektami canvas

## 🎯 Przepływ użycia

1. **Template Selection** - Użytkownik wybiera szablon lub tworzy od zera
2. **Design Phase** - Projektuje etykietę w edytorze modalnym
3. **Quantity Phase** - Określa ilość i opcje (UUID, QR codes)
4. **Generation** - Backend tworzy etykiety z unikalnymi identyfikatorami

## 💡 Przykład użycia

```typescript
import { BulkLabelCreationModal } from '@/features/bulk-label-creation';

function WorkspaceComponent() {
  const [showModal, setShowModal] = useState(false);

  const handleSuccess = (createdLabels) => {
    console.log(`Utworzono ${createdLabels.length} etykiet`);
    // Refresh labels list
  };

  return (
    <>
      <button onClick={() => setShowModal(true)}>
        Utwórz masowo
      </button>
      
      <BulkLabelCreationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        projectId={projectId}
        onSuccess={handleSuccess}
      />
    </>
  );
}
```

## 🔧 Konfiguracja Backend

Endpoint: `POST /api/label-management/projects/:projectId/bulk-create`

```typescript
{
  count: number;              // 1-10000
  name: string;              // Nazwa bazowa
  width: number;             // Wymiary w mm
  height: number;
  fabricData: object;        // Dane canvas z edytora
  generateUniqueUUIDs: boolean;
  qrCodeBaseData?: string;   // URL bazowy dla QR
  thumbnail?: string;        // Base64 podgląd
}
```

## 🎨 Integracja z Workspace

System jest zintegrowany z `ProjectWorkspace` poprzez przycisk "Utwórz masowo" obok standardowego "Nowa etykieta".

## 🔮 Przyszłe rozszerzenia

- **Szablony użytkownika** - Zapisywanie projektów jako szablony
- **Batch export** - Masowy eksport utworzonych etykiet  
- **Zaawansowane numerowanie** - Niestandardowe formaty nazw
- **Import danych** - CSV import dla różnych danych na etykietach

## 🛠️ Używane technologie

- **React** + **TypeScript** - Frontend
- **Framer Motion** - Animacje
- **Fabric.js** - Canvas edytor
- **Heroicons** - Ikony
- **Node.js** + **Prisma** - Backend
- **UUID** - Unikalne identyfikatory
