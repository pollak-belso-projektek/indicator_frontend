# 📊 Szakképzési Indikátor Rendszer (Frontend)

A Hódmezővásárhelyi Szakképzési Centrum (HSZC) és tagintézményei számára készült indikátor-követő, minőségirányítási és elemző webes alkalmazás.

---

## 📖 Részletes Rendszer- és Projekt Index

A projekt átfogó, részletes architektúrális térképe, a 36 indikátor katalógusa, a jogosultsági rendszer és az API integráció leírása megtalálható a **[PROJECT_INDEX.md](./PROJECT_INDEX.md)** fájlban.  
> 🤖 **Minden fejlesztőnek és AI agentnek javasolt először a [PROJECT_INDEX.md](./PROJECT_INDEX.md) fájlt áttekinteni!**

---

## 🛠️ Főbb Technológiai Elemek

- **Keretrendszer:** React 19 + Vite 6
- **UI:** Material UI (MUI v7), Chakra UI v3, Tailwind CSS v4
- **Állapotkezelés:** Redux Toolkit + RTK Query + Redux Persist
- **Diagramok:** Recharts
- **Adatimport:** XLSX / KRÉTA export feldolgozás

---

## 🚀 Fejlesztői Környezet Indítása

### Előfeltételek
- Node.js (v18+)
- npm vagy yarn

### Telepítés és Futtatás
```bash
# Függőségek telepítése
npm install

# Környezeti változók (.env) beállítása
# Másold át a .env.example fájlt .env-re és állítsd be a VITE_API_BASE_URL-t:
# VITE_API_BASE_URL=http://localhost:5300/

# Fejlesztői szerver indítása
npm run dev

# Építés (Production build)
npm run build

# Bundle méret elemzés
npm run analyze
```

---

## 📂 Fő Könyvtárak

- `src/pages/indicators/` - A 36 indikátor forráskódjai és komponensei
- `src/pages/DataImport.jsx` - KRÉTA és egyéb Excel import felületek
- `src/store/api/` - RTK Query API szeletek és végpontok (`apiSlice.js`)
- `src/utils/` - Jogosultsági szintek, tanévváltási logika, fájlvalidáció
- `apiguide/` - OpenAPI / Swagger backend specifikáció (`openapi.yaml`)
