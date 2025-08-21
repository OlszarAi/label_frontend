# Bulk Label Creation System v2.0

## 🎯 Nowy, Ulepsony System Tworzenia Etykiet Masowo

Ten system został całkowicie przepisany, aby rozwiązać problemy z identycznymi UUID i QR kodami w etykietach tworzonych masowo.

## ✨ Kluczowe Usprawnienia

### Przed (Stary System):
- ❌ Wszystkie etykiety miały identyczne `fabricData`
- ❌ Post-processing próbował naprawić UUID/QR po utworzeniu
- ❌ Problemy z synchronizacją i identycznymi kodami
- ❌ Gdy edytowałeś etykietę i dodawałeś UUID/QR, były inne niż oryginalne

### Po (Nowy System):
- ✅ Każda etykieta generowana z unikalnym `fabricData` przed utworzeniem
- ✅ Unikalny UUID dla każdej etykiety (konfigurowalnej długości)
- ✅ QR kody automatycznie używają prefiks + unikalny UUID
- ✅ Edycja etykiety zachowuje wszystkie UUID/QR obiekty identyczne
- ✅ System działa tak samo jak główny edytor

## 🏗️ Architektura

### Frontend Components
```
bulk-label-creation/
├── components/
│   ├── BulkLabelCreationModal.tsx     # Główny modal orkiestrujący proces
│   ├── BulkLabelEditor.tsx           # Edytor wzoru etykiety
│   ├── QuantitySelectionModal.tsx    # Konfiguracja ilości i UUID
│   └── TemplateSelectionModal.tsx    # Wybór szablonu
├── services/
│   ├── BulkLabelService.ts           # API calls - nowy endpoint
│   ├── BulkLabelPostProcessor.ts     # Generowanie unikalnych fabricData
│   └── TemplateService.ts           # Obsługa szablonów
├── hooks/
│   └── useBulkLabelCreation.ts       # Hook do tworzenia masowego
└── types/
    └── bulk-label.types.ts           # Typy TypeScript
```

### Backend Endpoints
```
POST /api/label-management/projects/:projectId/bulk-create-unique
```
- Nowy endpoint do tworzenia z unikalnymi fabricData
- Fallback do starego endpointu jeśli nowy nie istnieje

## 🔧 Jak to działa

### 1. Przygotowanie Wzoru
Użytkownik tworzy wzór etykiety w `BulkLabelEditor` lub wybiera szablon.

### 2. Analiza fabricData
```typescript
BulkLabelPostProcessor.analyzeFabricDataObjects(fabricData)
```
Analizuje czy wzór zawiera obiekty UUID lub QR.

### 3. Generowanie Unikalnych fabricData
```typescript
BulkLabelPostProcessor.generateUniqueFabricDataSet(
  templateFabricData,
  count,
  qrPrefix,
  uuidLength
)
```
Dla każdej etykiety:
- Generuje unikalny UUID (używając `generateUUID` z main editor)
- Klonuje template fabricData
- Ustawia `sharedUUID` we wszystkich objektach UUID/QR
- Ustawia `text` w objektach UUID
- Ustawia `data` w objektach QR (prefiks + UUID)

### 4. Tworzenie w Backend
```typescript
const bulkLabelsData = uniqueFabricDataSet.map((item, index) => ({
  name: `${baseName} ${index + 1}`,
  fabricData: item.fabricData, // Każda etykieta ma unikalne fabricData
  // ... inne właściwości
}))
```

### 5. Backend Processing
Nowy endpoint `createBulkLabelsUnique`:
- Przyjmuje array obiektów z już przygotowanymi fabricData
- Tworzy etykiety jedna po drugiej
- Zapewnia unikalne nazwy (backend deduplication)

## 🔍 Debugowanie

### Logi Frontend
```javascript
// W BulkLabelPostProcessor
console.log(`🏷️ Generated unique fabricData for label ${i + 1}/${count} with UUID: ${labelUUID}`);

// W BulkLabelService
console.log(`✨ Generated ${uniqueFabricDataSet.length} unique fabricData sets`);
console.log(`✅ Successfully created ${result.data?.length} labels with unique UUIDs`);
```

### Logi Backend
```javascript
// W createBulkLabelsUnique
Logger.info(`📦 Created ${i + 1}/${labelData.length} unique labels`);
Logger.info(`🎯 Successfully created ${createdLabels.length} labels with unique UUIDs`);
```

### Walidacja
```typescript
BulkLabelPostProcessor.validateLabelUUIDConsistency(fabricData, expectedUUID)
```
Sprawdza czy wszystkie obiekty UUID/QR używają tego samego UUID.

## 📋 Konfiguracja

### QR Prefix
- Domyślnie: `'https://label.app/'`
- Konfigurowalny przez użytkownika
- Format: `${qrPrefix}${uniqueUUID}`

### UUID Length
- Domyślnie: `8` znaków
- Zakres: `1-32` znaki
- Używa tego samego algorytmu co główny edytor

## 🚀 Wykorzystanie

```typescript
// W komponencie
const { createBulkLabels, isCreating, progress } = useBulkLabelCreation({
  projectId,
  onSuccess: (labels) => {
    // labels - każda ma unikalny UUID
  },
  onError: (error) => {
    // obsługa błędów
  }
});

// Tworzenie
await createBulkLabels({
  design: {
    name: 'Mój wzór',
    width: 100,
    height: 50,
    fabricData: { /* template z UUID/QR objektami */ }
  },
  options: {
    quantity: 100,
    baseName: 'Etykieta',
    qrPrefix: 'https://moja-domena.pl/',
    uuidLength: 12
  }
});
```

## 🔄 Backward Compatibility

System automatycznie wykrywa czy nowy endpoint istnieje:
- Jeśli TAK: używa nowego systemu z unikalnymi fabricData
- Jeśli NIE: fallback do starego systemu (z identycznymi fabricData)

## 🧪 Testing

1. **Utwórz wzór z obiektami UUID i QR**
2. **Wygeneruj masowo (np. 5 etykiet)**
3. **Sprawdź że każda ma inny UUID** w debugger/logs
4. **Edytuj etykietę → dodaj UUID/QR**
5. **Sprawdź że nowe obiekty mają ten sam UUID** co istniejące
6. **Kliknij "Regeneruj UUID"** - wszystkie obiekty powinny mieć nowy, identyczny UUID

## 💡 Dlaczego to działa lepiej

**Główna różnica**: Zamiast tworzyć identyczne etykiety i próbować je "naprawić" później, generujemy każdą etykietę z właściwymi UUID od razu - tak samo jak robi to główny edytor gdy tworzysz pojedynczą etykietę.

To zapewnia 100% spójność i eliminuje wszystkie problemy synchronizacji.
