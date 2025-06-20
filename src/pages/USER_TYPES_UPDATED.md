# Frissített Felhasználó Típusok

## 7 Felhasználó Típus

A rendszer most már pontosan követi a meghatározott felhasználó típusokat:

### 1. **Superadmin**

- Minden funkciót elérhet
- Minden típusú felhasználót létrehozhat
- Teljes rendszer adminisztráció

### 2. **HSZC Admin**

- HSZC és Iskolai felhasználókat hozhat létre
- HSZC szintű adminisztrációs jogok
- Minden HSZC és Iskolai funkció elérhető

### 3. **HSZC Privilegizált**

- Kiterjesztett HSZC jogosultságok
- Adatok módosítása és elemzése
- Nem hozhat létre felhasználókat

### 4. **HSZC Általános**

- Alapvető HSZC jogosultságok
- Adatok megtekintése és alapvető műveletek

### 5. **Iskolai Admin**

- Csak Iskolai felhasználókat hozhat létre
- Iskolai szintű adminisztráció
- Saját iskola adatainak kezelése

### 6. **Iskolai Privilegizált**

- Kiterjesztett Iskolai jogosultságok
- Iskolai adatok módosítása
- Nem hozhat létre felhasználókat

### 7. **Iskolai Általános**

- Alapvető Iskolai jogosultságok
- Adatok megtekintése

## Felhasználó Létrehozási Szabályok

### Superadmin:

- ✅ Minden típusú felhasználót létrehozhat

### HSZC Admin:

- ✅ HSZC Privilegizált
- ✅ HSZC Általános
- ✅ Iskolai Admin
- ✅ Iskolai Privilegizált
- ✅ Iskolai Általános

### Iskolai Admin:

- ✅ Iskolai Admin
- ✅ Iskolai Privilegizált
- ✅ Iskolai Általános

### Egyéb felhasználók:

- ❌ Nem hozhatnak létre felhasználókat

## Módosítási Szabályok

- ✅ Csak adminok (HSZC Admin, Iskolai Admin, Superadmin) módosíthatnak felhasználókat
- ❌ Törlés nem lehetséges, csak inaktiválás

## Technikai Változások

1. **useUserPermissions.js**: Frissítve az új felhasználó típusokkal
2. **UserRoleBadge.jsx**: Magyar szerepnevek megjelenítése
3. **CreateUserDialog.jsx**: Új jogosultsági struktúra
4. **Hierarchia**: Pontosan definiált jogosultsági szintek

## Megjelenítés

A felhasználó típusok most már magyarul jelennek meg:

- 👑 Superadmin
- 🛡️ HSZC Admin / Iskolai Admin
- ⭐ HSZC Privilegizált / Iskolai Privilegizált
- 👤 HSZC Általános / Iskolai Általános

## API Payload Formátum

⚠️ **FONTOS VÁLTOZÁS**: A CreateUserDialog most már **hierarchia számot** küld a komplex permissions objektum helyett!

### Új Payload Formátum:

```json
{
  "name": "Teszt Felhasználó",
  "email": "teszt@example.com",
  "password": "jelszó123",
  "hierarchyLevel": 7, // Superadmin esetén 7
  "active": true
}
```

### Hierarchia Mapping:

```javascript
const USER_HIERARCHY = {
  ISKOLAI_GENERAL: 1, // Iskolai Általános
  ISKOLAI_PRIVILEGED: 2, // Iskolai Privilegizált
  ISKOLAI_ADMIN: 3, // Iskolai Admin
  HSZC_GENERAL: 4, // HSZC Általános
  HSZC_PRIVILEGED: 5, // HSZC Privilegizált
  HSZC_ADMIN: 6, // HSZC Admin
  SUPERADMIN: 7, // Superadmin
};
```

### Előnyök:

- ✅ Egyszerűbb API kommunikáció
- ✅ Könnyebb jogosultság kezelés
- ✅ Tisztább adatszerkezet
- ✅ Gyorsabb feldolgozás
- ✅ Kevesebb adatátvitel

## Refresh Token Authentication

⚠️ **FONTOS**: A refresh token most már a `x-refresh-token` header-ben küldendő:

```javascript
// Helyes megoldás - x-refresh-token header
const refreshResult = await baseQuery({
  url: "auth/refresh",
  method: "POST",
  headers: {
    "x-refresh-token": refreshToken,
  },
});

// Régi megoldás (nem működik) - body-ban
const refreshResult = await baseQuery({
  url: "auth/refresh",
  method: "POST",
  body: { refreshToken }, // ❌ NE így!
});
```

## Frissített Hierarchia Szintek

A hierarchia szintek most már a következő értékeket használják:

- **1**: Iskolai Általános
- **2**: Iskolai Privilegizált
- **4**: Iskolai Admin
- **9**: HSZC Általános
- **10**: HSZC Privilegizált
- **15**: HSZC Admin
- **31**: Superadmin

Ez a nem szekvenciális számbeosztás lehetővé teszi a jövőbeli bővítést a szintek között.
