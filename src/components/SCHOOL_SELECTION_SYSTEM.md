# School Selection Requirement System

## Overview

A rendszer tartalmaz egy listát azokról az oldalakról, amelyeknél kötelező iskolát választani az adatok megtekintéséhez. Ha nincs kiválasztva iskola, akkor egy figyelmeztető üzenet jelenik meg.

## Implementáció

### SchoolRequiredWrapper komponens

A `SchoolRequiredWrapper` komponens felelős a iskola kiválasztás ellenőrzéséért:

- Ellenőrzi, hogy van-e kiválasztott iskola a Redux store-ban
- Ha nincs kiválasztott iskola, megjeleníti a figyelmeztető üzenetet
- Ha van kiválasztott iskola, megjeleníti a gyermek komponenst

### Router.jsx módosítások

1. **SCHOOL_REQUIRED_PAGES lista**: Az összes oldal útvonala, amelyek iskolaválasztást igényelnek
2. **withSchoolRequired helper függvény**: Automatikusan becsomagolja a komponenseket a `SchoolRequiredWrapper`-be, ha szükséges
3. **Route frissítések**: Az összes érintett route használja a helper függvényt

## Érintett oldalak

Az alábbi oldalak igényelnek iskola kiválasztást:

### Tanulói adatok

- `/tanulo_letszam` - Tanulólétszám
- `/felvettek_szama` - Felvettek száma
- `/sajatos-nevelesi-igenyu-tanulok-aranya` - Sajátos nevelési igényű tanulók
- `/hatranyos-helyezu-tanulok-aranya` - Hátrányos helyzetű tanulók

### Oktatási eredmények

- `/kompetencia` - Kompetencia
- `/orszagos-kompetenciameres` - Országos kompetenciamérés
- `/nszfh-meresek` - NSZFH mérések
- `/vizsgaeredmenyek` - Vizsgaeredmények
- `/elegedettseg-meres-eredmenyei` - Elégedettség mérés

### Eredmények és elismerések

- `/szakmai-eredmenyek` - Szakmai eredmények
- `/intezmenyi-elismeresek` - Intézményi elismerések

### Pályakövetés

- `/elhelyezkedesi-mutato` - Elhelyezkedési mutató
- `/vegzettek-elegedettsege` - Végzettek elégedettsége
- `/szakkepzesi-munkaszerződes-arany` - Szakképzési munkaszerződés

### Speciális programok

- `/felnottkepzes` - Felnőttképzés
- `/muhelyiskolai-reszszakmat` - Műhelyiskola
- `/dobbanto-program-aranya` - Dobbantó program
- `/intezmenyi-nevelesi-mutatok` - Intézményi nevelési mutatók

### Események és aktivitás

- `/szakmai-bemutatok-konferenciak` - Szakmai bemutatók
- `/oktato_per_diak` - Egy oktatóra jutó diák
- `/oktatok-egyeb-tev` - Oktatók egyéb tevékenység

## Használat

### Új oldal hozzáadása a listához

1. Adja hozzá az útvonalat a `SCHOOL_REQUIRED_PAGES` tömbhöz
2. Használja a `withSchoolRequired` helper függvényt a route definícióban

```jsx
// 1. Hozzáadás a listához
const SCHOOL_REQUIRED_PAGES = [
  // ...existing pages...
  "/uj-oldal",
];

// 2. Route definíció
<Route
  path="/uj-oldal"
  element={
    <TableProtectedRoute>
      <NavigationWithLoading>
        {withSchoolRequired(<UjOldalPage />, "/uj-oldal")}
      </NavigationWithLoading>
    </TableProtectedRoute>
  }
/>;
```

### Oldal eltávolítása a listából

Egyszerűen távolítsa el az útvonalat a `SCHOOL_REQUIRED_PAGES` tömbből.

## Üzenet testreszabása

A figyelmeztető üzenet módosítható a `SchoolRequiredWrapper.jsx` fájlban:

```jsx
<Typography variant="h6" component="div" mb={1}>
  Kérjük válasszon ki egy iskolát az adatok megtekintéséhez!
</Typography>
<Typography variant="body2" color="text.secondary">
  Az iskola kiválasztása a bal felső sarokban található iskola választóval lehetséges.
</Typography>
```

## Kompatibilitás

Ez a rendszer kompatibilis a meglévő `SchoolSelectionIndicator` komponenssel, és együtt használható ugyanazon az oldalon.
