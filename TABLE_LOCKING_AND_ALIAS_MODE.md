# Table Locking and Alias Mode Features

## Tábla Lezárás/Feloldás (Table Locking/Unlocking)

### Áttekintés (Overview)

A tábla lezárás funkció lehetővé teszi a HSZC szintű felhasználók (HSZC General, HSZC Privileged, HSZC Admin) és a Superadmin számára, hogy lezárjanak vagy feloldjanak adott táblákat a rendszerben.

### Jogosultságok (Permissions)

- **HSZC General** (level 9): Táblák lezárása/feloldása
- **HSZC Privileged** (level 10): Táblák lezárása/feloldása
- **HSZC Admin** (level 15): Táblák lezárása/feloldása
- **Superadmin** (level 31): Táblák lezárása/feloldása

Iskolai szintű felhasználók (Iskolai General, Iskolai Privileged, Iskolai Admin) **NEM** tudnak táblákat lezárni.

### Használat (Usage)

1. Navigálj a **Tábla kezelés** oldalra (Table Management)
2. A táblák listájában minden tábla mellett látható:
   - **Státusz**: Elérhető vagy Nem elérhető
   - **Lezárva**: Lezárva (piros) vagy Aktív (zöld) - csak HSZC+ felhasználóknak
3. A műveletek oszlopban:
   - **Szerkesztés ikon** (ceruza): Tábla tulajdonságainak szerkesztése
   - **Lakat ikon** (piros): Tábla lezárása
   - **Nyitott lakat ikon** (zöld): Tábla feloldása

### Működés (How It Works)

- Amikor egy táblát lezársz, az `isLocked` mező `true` értékre állítódik
- Lezárt táblák esetén a módosítások megakadályozása backend szinten történik
- A lezárási/feloldási műveletek naplózásra kerülnek a rendszerben

### Backend API Végpontok (Backend API Endpoints)

```
POST /api/tablelist/{tableId}/lock    - Tábla lezárása
POST /api/tablelist/{tableId}/unlock  - Tábla feloldása
```

## Superadmin Alias Funkció (Superadmin Alias Mode)

### Áttekintés (Overview)

Az alias mód lehetővé teszi a Superadmin felhasználók számára, hogy úgy tekintsék meg az alkalmazást, mintha egy másik felhasználó lennének. Ez hasznos hibakereséshez és támogatáshoz.

### Jogosultságok (Permissions)

- Csak **Superadmin** (level 31) felhasználók használhatják ezt a funkciót

### Használat (Usage)

1. Lépj be Superadmin felhasználóként
2. A Dashboard oldalon kattints az **"Alias mód"** gombra (jobb felső sarokban)
3. Válaszd ki a felhasználót, akinek a szerepkörét szeretnéd használni
4. Az alkalmazás mostantól úgy fog működni, mintha az a felhasználó lennél
5. A képernyő tetején megjelenik egy **narancssárga banner**, ami jelzi az alias módot
6. A kilépéshez kattints a banner-en található **"Kilépés az alias módból"** gombra

### Működés (How It Works)

1. **Aktiválás**:
   - Az eredeti Superadmin felhasználó adatai mentésre kerülnek (`originalUser`)
   - A kiválasztott felhasználó adatai betöltődnek (`aliasUser`)
   - Az alkalmazás az alias felhasználó jogosultságait használja

2. **Alias Módban**:
   - Minden nézet az alias felhasználó jogosultságai alapján működik
   - A tábla hozzáférések az alias felhasználóéi
   - Az iskola választó csak az alias felhasználó iskoláit mutatja
   - A navigációs menü az alias felhasználó jogosultságai szerint szűrődik

3. **Kilépés**:
   - Az eredeti Superadmin jogosultságok visszaállítódnak
   - Az alias felhasználó adatai törlődnek
   - A munkamenet normál módban folytatódik

### Korlátozások (Limitations)

- Alias módban **NEM** lehet:
  - Adatokat törölni (backend szinten tiltva)
  - Kritikus beállításokat módosítani (backend szinten tiltva)
  - Más felhasználók jelszavát megváltoztatni

### Naplózás (Logging)

Minden alias mód aktiválás és deaktiválás naplózásra kerül:
- Melyik Superadmin használta
- Melyik felhasználót választotta
- Mikor aktiválta/deaktiválta

### UI Komponensek (UI Components)

1. **AliasModeDialog** (`src/components/AliasModeDialog.jsx`)
   - Felhasználó kiválasztó dialógus
   - Keresés név, email vagy iskola szerint
   - Felhasználó típus megjelenítése

2. **AliasModeBanner** (`src/components/AliasModeBanner.jsx`)
   - Állandóan látható banner az oldal tetején
   - Jelzi az aktív alias módot
   - "Kilépés az alias módból" gomb

### Redux State (Állapotkezelés)

```javascript
// authSlice state
{
  aliasMode: false,           // Aktív-e az alias mód
  originalUser: null,         // Eredeti Superadmin felhasználó
  aliasUser: null,           // Kiválasztott alias felhasználó
  user: {...}                // Aktuális felhasználó (alias módban az aliasUser)
}

// Actions
enableAliasMode(user)   // Alias mód aktiválása
disableAliasMode()      // Alias mód deaktiválása
```

## Fejlesztői Megjegyzések (Developer Notes)

### Új Funkciók Tesztelése (Testing New Features)

1. **Tábla Lezárás**:
   ```bash
   # HSZC felhasználóként próbáld lezárni egy táblát
   # Ellenőrizd, hogy a tábla státusza "Lezárva" lett-e
   # Próbálj módosítani egy lezárt táblán keresztül
   ```

2. **Alias Mód**:
   ```bash
   # Superadmin-ként aktiváld az alias módot
   # Válassz egy iskolai szintű felhasználót
   # Ellenőrizd, hogy csak az ő jogosultságai látszanak
   # Próbálj meg különböző műveleteket végrehajtani
   ```

### Függőségek (Dependencies)

- Redux Toolkit (állapotkezelés)
- Material-UI (UI komponensek)
- React Router (navigáció)

### Backend Követelmények (Backend Requirements)

A backend-nek támogatnia kell:
1. `POST /api/tablelist/{id}/lock` - Tábla lezárása
2. `POST /api/tablelist/{id}/unlock` - Tábla feloldása
3. `isLocked` mező a tábla sémában
4. Lezárt táblák módosításának megakadályozása
5. Alias mód aktivitás naplózása

## Biztonsági Megfontolások (Security Considerations)

1. **Tábla Lezárás**:
   - Csak HSZC+ szintű felhasználók zárhatnak le táblákat
   - A lezárás backend szinten is érvényesül
   - Minden lezárási művelet naplózásra kerül

2. **Alias Mód**:
   - Csak Superadmin használhatja
   - Kritikus műveletek tiltva alias módban
   - Minden alias aktivitás naplózva van
   - Session időkorlát alkalmazandó
