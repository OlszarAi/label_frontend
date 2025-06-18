# User Profile Module

## 📋 Opis
Moduł profilu użytkownika zorganizowany zgodnie z architekturą features. Zawiera pełnofunkcjonalny profil użytkownika z zakładkami i integracją z backendem.

## 🏗️ Struktura
```
user-profile/
├── components/           # Komponenty React
│   ├── UserProfile.tsx          # Główny komponent z nawigacją
│   ├── ProfileOverview.tsx      # Zakładka: Przegląd
│   ├── ProfileSubscription.tsx  # Zakładka: Subskrypcja
│   ├── ProfileSettings.tsx      # Zakładka: Ustawienia
│   ├── ProfileSecurity.tsx      # Zakładka: Bezpieczeństwo
│   └── ProfileBilling.tsx       # Zakładka: Płatności
├── hooks/
│   └── useProfile.ts            # Hook do zarządzania danymi profilu
├── services/
│   └── profileService.ts        # Serwis komunikacji z API
├── types/
│   └── profile.types.ts         # Typy TypeScript
├── constants/
│   └── profile.constants.ts     # Stałe i konfiguracja
├── styles/
│   └── ProfilePage.css          # Style CSS
├── index.ts                     # Punkt wejścia modułu
└── README.md                    # Ten plik
```

## ✅ Co działa (integracja z backendem)

### Dane pobierane z API:
- **Podstawowe dane użytkownika** - imię, nazwisko, email, avatar ✅
- **Aktualna subskrypcja** - plan, status, daty, limity ✅
- **Historia subskrypcji** - wszystkie poprzednie plany ✅
- **Statystyki użytkownika** - podstawowe metryki (rozszerzalne) ✅

### Funkcjonalności:
1. **Edycja profilu** - zmiana imienia, nazwiska, avatara ✅
2. **Zmiana hasła** - walidacja i aktualizacja hasła ✅
3. **Wyświetlanie subskrypcji** - aktualny plan i historia ✅
4. **Automatyczne odświeżanie** - po edycji profilu i zmianie hasła ✅

### Endpointy backendu:
- `GET /api/auth/profile/full` - pełne dane profilu ✅
- `PUT /api/auth/profile` - aktualizacja profilu ✅
- `POST /api/auth/change-password` - zmiana hasła ✅

**UWAGA**: Mock data jest wyłączone (`USE_MOCK_DATA = false`), więc wszystkie dane pochodzą z prawdziwego backendu.

## 🧪 Co jest testowe/przykładowe

### ProfileBilling.tsx (Płatności):
- **Metody płatności** - przykładowe karty kredytowe
- **Historia płatności** - fikcyjne transakcje
- **Faktury** - przykładowe dokumenty
- **Funkcje** - dodawanie/usuwanie kart, pobieranie faktur

### ProfileSubscription.tsx (częściowo):
- **Porównanie planów** - statyczne dane planów (Basic, Pro, Enterprise)
- **Funkcje upgrade/downgrade** - tylko UI, brak integracji

### ProfileOverview.tsx (częściowo):
- **Niektóre statystyki** - mogą być rozszerzone o rzeczywiste dane z bazy

## 🔧 Konfiguracja rozwoju

### Zmienne środowiskowe:
```typescript
// W profileService.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
```

### Tryb deweloperski:
**Mock data jest wyłączone** (`USE_MOCK_DATA = false` w `useProfile.ts`).
Aby włączyć mock data dla rozwoju bez backendu, zmień na `true`.

### Znane problemy i rozwiązania:
1. **Problem**: Mock data pokazywało STARTER zamiast prawdziwych danych FREE z bazy
   - **Rozwiązanie**: Wyłączono mock data (`USE_MOCK_DATA = false`)
   - **Status**: ✅ Naprawione

2. **Problem**: Błąd HTTP 404 przy próbie pobrania historii subskrypcji
   - **Przyczyna**: Hook próbował osobno pobierać historię z nieistniejącego endpointu
   - **Rozwiązanie**: Hook teraz używa tylko `/api/auth/profile/full` (zawiera już wszystkie dane)
   - **Status**: ✅ Naprawione

## 🚀 Użycie

### Importowanie:
```typescript
import { UserProfile } from '@/features/user-profile';
```

### W komponencie:
```tsx
export default function ProfilePage() {
  return <UserProfile />;
}
```

### Hook profilu:
```typescript
import { useProfile } from '@/features/user-profile/hooks/useProfile';

const { profile, loading, error, updateProfile, changePassword } = useProfile();
```

## 📝 TODO / Przyszłe rozszerzenia

### Integracja z backendem:
- [ ] System płatności (Stripe/PayPal)
- [ ] Upgrade/downgrade subskrypcji
- [ ] Zarządzanie metodami płatności
- [ ] Generowanie faktur
- [ ] Powiadomienia email

### Dodatkowe funkcjonalności:
- [ ] Eksport danych użytkownika
- [ ] Usuwanie konta
- [ ] Dwuskładnikowa autoryzacja (2FA)
- [ ] Preferencje powiadomień
- [ ] Zarządzanie sesjami

### Optymalizacje:
- [ ] Lazy loading zakładek
- [ ] Optimistic updates
- [ ] Lepsze error handling
- [ ] Loading states per sekcja
- [ ] Testy jednostkowe i integracyjne

## 🔍 Debugowanie

### Logi:
Sprawdź console.log w `profileService.ts` i `useProfile.ts`.

### Network:
Monitoruj requesty do `/api/auth/profile/*` w DevTools.

### Prisma Studio:
Sprawdź dane w bazie: `npx prisma studio` (w katalogu backend).

## 📄 Licencja
Projekt wewnętrzny - Label Application.
