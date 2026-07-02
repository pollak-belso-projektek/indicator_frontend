/**
 * Egységes szín konstansok az összes indikátorhoz.
 *
 * Használat:
 *   import { INDICATOR_COLORS as IC } from "../../../utils/indicatorColors";
 *   backgroundColor: IC.bg.blue
 */

export const INDICATOR_COLORS = {
  // ── Háttérszínek (teljes) ──────────────────────────────────────────
  bg: {
    /** Halvány piros – összesítő sorok, figyelmeztetés, törlés jelzés */
    red: "#ffcdd2",
    /** Halvány zöld – sikeres állapot, pozitív értékek */
    green: "#e8f5e8",
    /** Halvány narancs/sárga – figyelmeztetés, közepes értékek */
    orange: "#fff3e0",
    /** Halvány kék – fejléc, info kiemelés, szekciók */
    blue: "#f0f8ff",
    /** Halvány lila – speciális kategóriák (SNI, összehasonlítás) */
    purple: "#f3e5f5",
    /** Halvány sárga – számított mezők, Kréta adatok */
    yellow: "#fff9c4",
    /** Szürke – alternatív sorok, neutrális háttér */
    gray: "#f5f5f5",
    /** Fehér */
    white: "#ffffff",
  },

  // ── Háttérszínek (halvány / alpha) ─────────────────────────────────
  bgAlpha: {
    /** Halvány piros háttér (25% átlátszóság) */
    red: "#ffcdd240",
    /** Halvány zöld háttér (25% átlátszóság) */
    green: "#e8f5e840",
    /** Halvány narancs háttér (25% átlátszóság) */
    orange: "#fff3e040",
    /** Halvány kék háttér (25% átlátszóság) */
    blue: "#f0f8ff40",
    /** Halvány lila háttér (25% átlátszóság) */
    purple: "#f3e5f540",
  },

  // ── Szöveg színek ─────────────────────────────────────────────────
  text: {
    /** Piros szöveg – negatív értékek, hibák, kötelező mezők */
    red: "#d32f2f",
    /** Zöld szöveg – pozitív értékek */
    green: "#2e7d32",
    /** Kék szöveg – linkek, kiemelt adatok */
    blue: "#1976d2",
    /** Szürke szöveg – másodlagos, disabled */
    gray: "#666666",
    /** Fekete szöveg */
    black: "#000000",
  },

  // ── Szegély / border színek ────────────────────────────────────────
  border: {
    /** Szürke szegély */
    gray: "#e0e0e0",
  },
};
