import {
  MdHome,
  MdSettings,
  MdSchool,
  MdGroup,
  MdBook,
  MdStar,
  MdBookmark,
  MdUpload,
} from "react-icons/md";

// All available navigation items with their table mappings
export const AllLinkItems = [
  { name: "Főoldal", icon: MdHome, link: "/dashboard", tableName: null }, // Always visible
  {
    name: "Alapadatok",
    icon: MdSettings,
    link: "/alapadatok",
    tableName: null,
  },
  {
    name: "Iskolák",
    icon: MdSchool,
    link: "/schools",
    tableName: "alapadatok",
  },
  {
    name: "Tanulólétszám",
    icon: MdGroup,
    link: "/tanulo_letszam",
    tableName: "tanulo_letszam",
  },
  {
    name: "Kompetencia",
    icon: MdBook,
    link: "/kompetencia",
    tableName: "kompetencia",
  },
  {
    name: "Versenyek",
    icon: MdStar,
    link: "/versenyek",
    tableName: "versenyek",
  },
  {
    name: "Felvettek száma",
    icon: MdGroup,
    link: "/felvettek_szama",
    tableName: "felvettek_szama",
  },
  {
    name: "Oktató per diák",
    icon: MdBookmark,
    link: "/oktato_per_diak",
    tableName: "oktato_per_diak",
  },
  {
    name: "Adatok Importálása a Kréta rendszerből",
    icon: MdUpload,
    link: "/adat-import",
    tableName: null,
  },
];

// Separate always visible items from permission-based items
export const getAlwaysVisibleItems = () => AllLinkItems.filter(item => item.tableName === null);
export const getPermissionBasedItems = () => AllLinkItems.filter(item => item.tableName !== null);