# Label Frontend

## Struktura Projektu

Projekt został zorganizowany w sposób umożliwiający łatwe zarządzanie dużą aplikacją z wieloma systemami i funkcjonalnościami.

### 📁 Główne Katalogi

```
src/
├── app/                    # Next.js App Router - routing i layouty
├── components/             # Komponenty wielokrotnego użytku
│   ├── ui/                # Podstawowe komponenty UI (Button, Input, Modal)
│   ├── forms/             # Komponenty formularzy
│   ├── layout/            # Komponenty layoutu (Header, Footer, Sidebar)
│   ├── navigation/        # Komponenty nawigacji
│   ├── modals/            # Komponenty modali
│   ├── charts/            # Komponenty wykresów
│   ├── tables/            # Komponenty tabel
│   └── cards/             # Komponenty kart
├── features/              # Funkcjonalności aplikacji (moduły biznesowe)
├── hooks/                 # Custom React hooks
├── utils/                 # Funkcje pomocnicze
├── services/              # Usługi API i logika biznesowa
├── types/                 # Definicje typów TypeScript
├── constants/             # Stałe aplikacji
├── assets/                # Zasoby statyczne
│   ├── images/
│   ├── icons/
│   └── fonts/
├── styles/                # Globalne style
├── lib/                   # Konfiguracje bibliotek zewnętrznych
├── config/                # Konfiguracja aplikacji
├── store/                 # Stan globalny (Redux, Zustand, etc.)
└── providers/             # Context providers

docs/                      # Dokumentacja projektu
tests/                     # Testy
├── unit/                  # Testy jednostkowe
├── integration/           # Testy integracyjne
└── e2e/                   # Testy end-to-end
scripts/                   # Skrypty automatyzacji
```

## 🚀 Wytyczne Dodawania Nowych Funkcjonalności

### 1. Nowa Funkcjonalność Biznesowa

Każda nowa funkcjonalność powinna być utworzona jako moduł w folderze `features/`:

```
src/features/nazwa-funkcjonalnosci/
├── components/            # Komponenty specyficzne dla tej funkcjonalności
├── hooks/                 # Hooks specyficzne dla tej funkcjonalności
├── services/              # API calls i logika biznesowa
├── types/                 # Typy specyficzne dla tej funkcjonalności
├── utils/                 # Funkcje pomocnicze
├── constants/             # Stałe specyficzne dla tej funkcjonalności
└── index.ts               # Eksport publiczny interfejsu
```

**Przykład:** Funkcjonalność zarządzania użytkownikami
```
src/features/user-management/
├── components/
│   ├── UserList.tsx
│   ├── UserForm.tsx
│   └── UserCard.tsx
├── hooks/
│   ├── useUsers.ts
│   └── useUserForm.ts
├── services/
│   └── userService.ts
├── types/
│   └── user.types.ts
└── index.ts
```

### 2. Nowy Komponent UI

Komponenty wielokrotnego użytku dodawaj do odpowiedniego podkatalogu w `components/`:

- **UI podstawowe:** `components/ui/` (Button, Input, Select, etc.)
- **Formularze:** `components/forms/` (LoginForm, ContactForm, etc.)
- **Layout:** `components/layout/` (Header, Footer, Sidebar, etc.)
- **Nawigacja:** `components/navigation/` (Navbar, Breadcrumbs, etc.)

### 3. Nowa Strona/Route

Używaj Next.js App Router w folderze `src/app/`:

```
src/app/
├── dashboard/
│   ├── page.tsx           # /dashboard
│   ├── layout.tsx         # Layout dla dashboard
│   └── users/
│       ├── page.tsx       # /dashboard/users
│       └── [id]/
│           └── page.tsx   # /dashboard/users/[id]
```

### 4. Nowy Hook

Custom hooks dodawaj do `src/hooks/`:

```typescript
// src/hooks/useLocalStorage.ts
export function useLocalStorage<T>(key: string, initialValue: T) {
  // implementacja
}
```

### 5. Nowa Usługa API

Usługi API dodawaj do `src/services/`:

```typescript
// src/services/userService.ts
export const userService = {
  getUsers: () => fetch('/api/users'),
  getUserById: (id: string) => fetch(`/api/users/${id}`),
  createUser: (user: CreateUserRequest) => fetch('/api/users', { method: 'POST', body: JSON.stringify(user) }),
}
```

### 6. Nowe Typy

Definicje typów dodawaj do `src/types/`:

```typescript
// src/types/user.types.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}
```

## 📋 Zasady Organizacji Kodu

### Nazewnictwo

- **Foldery:** kebab-case (`user-management`, `api-client`)
- **Komponenty:** PascalCase (`UserList.tsx`, `NavButton.tsx`)
- **Hooks:** camelCase z prefiksem `use` (`useUsers.ts`, `useLocalStorage.ts`)
- **Usługi:** camelCase z suffiksem `Service` (`userService.ts`, `apiService.ts`)
- **Typy:** PascalCase z suffiksem odpowiednim do kontekstu (`User`, `CreateUserRequest`)

### Struktura Plików

1. **Każdy folder funkcjonalności powinien mieć `index.ts`** - eksportuje publiczny interfejs
2. **Komponenty powinny być w osobnych plikach** - jeden komponent = jeden plik
3. **Testy powinny być obok plików źródłowych** - `Component.tsx` i `Component.test.tsx`
4. **Stałe powinny być w UPPER_CASE** - `MAX_USERS_PER_PAGE`

### Import/Export

Używaj barrel exports (`index.ts`) dla każdego modułu:

```typescript
// src/features/user-management/index.ts
export { UserList } from './components/UserList';
export { useUsers } from './hooks/useUsers';
export type { User, CreateUserRequest } from './types/user.types';
```

Dzięki temu importy są czytelne:
```typescript
import { UserList, useUsers, type User } from '@/features/user-management';
```

## 🔧 Konfiguracja Środowiska

### Uruchomienie Projektu

```bash
npm install
npm run dev
```

### Dostępne Skrypty

- `npm run dev` - uruchomienie w trybie deweloperskim
- `npm run build` - budowanie produkcyjne
- `npm run start` - uruchomienie w trybie produkcyjnym
- `npm run lint` - sprawdzanie kodu ESLint
- `npm run test` - uruchomienie testów

## 📝 Dodatkowe Wskazówki

1. **Zawsze twórz typy TypeScript** - nie używaj `any`
2. **Używaj Custom Hooks** - wynoś logikę poza komponenty
3. **Komponenty powinny być małe** - jedna odpowiedzialność
4. **Testuj krytyczne funkcjonalności** - szczególnie usługi i hooks
5. **Dokumentuj złożone funkcje** - JSDoc dla funkcji publicznych
6. **Używaj absolutnych importów** - konfiguracja `@/*` jest gotowa

## 🏗️ Rozszerzanie Struktury

Gdy projekt rośnie, możesz dodawać nowe katalogi:

- `src/animations/` - animacje i przejścia
- `src/themes/` - różne motywy aplikacji
- `src/i18n/` - internacjonalizacja
- `src/middleware/` - middleware dla API
- `src/schemas/` - schematy walidacji (Zod, Yup)

Pamiętaj o aktualizacji tego README przy dodawaniu nowych konwencji!
