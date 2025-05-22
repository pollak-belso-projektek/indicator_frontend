import "./App.css";
import { ReactSpreadsheetImport } from "react-spreadsheet-import";
import { Button } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  useAddTanugyiAdatokMutation,
  useGetAlapadatokQuery,
  useGetTanugyiAdatokQuery,
} from "./store/api/apiSlice";

function App() {
  const [data, setData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: TanugyiData,
    error,
    isLoading,
  } = useGetTanugyiAdatokQuery({
    alapadatok_id: "2e31291b-7c2d-4bd8-bdca-de8580136874",
    ev: 2024,
  });
  const {
    data: AlapadatokData,
    error: AlapadatokError,
    isLoading: isAlapadatokLoading,
  } = useGetAlapadatokQuery({ id: "2e31291b-7c2d-4bd8-bdca-de8580136874" });

  const [addTanugyiAdatok, result] = useAddTanugyiAdatokMutation();

  console.log(TanugyiData);

  const fields = [
    {
      label: "Előtag",
      key: "elotag",
      alternateMatches: ["Előtag", "elotag"],
      fieldType: {
        type: "input",
      },
      example: "",
      validations: [],
    },
    {
      label: "Vezetéknév",
      key: "vezeteknev",
      alternateMatches: ["Vezetéknév", "vezeteknev"],
      fieldType: {
        type: "input",
      },
      example: "Teszt",
      validations: [
        {
          rule: "required",
          errorMessage: "A Vezetéknév kötelező",
        },
      ],
    },
    {
      label: "Utónév",
      key: "utonev",
      alternateMatches: ["Utónév", "utonev"],
      fieldType: {
        type: "input",
      },
      example: "János",
      validations: [
        {
          rule: "required",
          errorMessage: "Az Utónév kötelező",
        },
      ],
    },
    {
      label: "Jogviszonyát szüneteltető",
      key: "jogviszonyátSzunetelteto",
      alternateMatches: [
        "Jogviszonyát szüneteltető",
        "jogviszonyátSzunetelteto",
      ],
      fieldType: {
        type: "input",
      },
      example: "False",
      validations: [
        {
          rule: "required",
          errorMessage: "A Jogviszonyát szüneteltető kötelező",
        },
      ],
    },
    {
      label: "Tankötelezettséget teljesítő",
      key: "tankotelezettsegetTeljesito",
      alternateMatches: [
        "Tankötelezettséget teljesítő",
        "tankotelezettsegetTeljesito",
      ],
      fieldType: {
        type: "input",
      },
      example: "False",
      validations: [
        {
          rule: "required",
          errorMessage: "A Tankötelezettséget teljesítő kötelező",
        },
      ],
    },
    {
      label: "Tankötelezettség vége",
      key: "tankotelezettségVege",
      alternateMatches: ["Tankötelezettség vége", "tankotelezettségVege"],
      fieldType: {
        type: "input",
      },
      example: "2020.08.08",
      validations: [
        {
          rule: "required",
          errorMessage: "A Tankötelezettség vége kötelező",
        },
      ],
    },
    {
      label: "Bejáró",
      key: "bejaro",
      alternateMatches: ["Bejáró", "bejaro"],
      fieldType: {
        type: "input",
      },
      example: "False",
      validations: [
        {
          rule: "required",
          errorMessage: "A Bejáró kötelező",
        },
      ],
    },
    // Oktatási azonosí
    {
      label: "Oktatási azonosítója",
      key: "oktatasiAzonositoja",
      alternateMatches: ["Oktatási azonosítója", "oktatasiAzonositoja"],
      fieldType: {
        type: "input",
      },
      example: "123456789ABC",
      validations: [
        {
          rule: "required",
          errorMessage: "Az oktatási azonosító megadása kötelező",
        },
      ],
    },
    // Osztály
    {
      label: "Osztály",
      key: "osztaly",
      alternateMatches: ["Osztály", "osztaly"],
      fieldType: {
        type: "input",
      },
      example: "12.B",
      validations: [
        {
          rule: "required",
          errorMessage: "Az osztály megadása kötelező",
        },
      ],
    },
    // Születési dátum
    {
      label: "Születési dátuma",
      key: "szuletesiDatuma",
      alternateMatches: ["Születési dátuma", "szuletesiDatuma"],
      fieldType: {
        type: "input",
      },
      example: "2000-12-24",
      validations: [
        {
          rule: "required",
          errorMessage: "A születési dátum megadása kötelező",
        },
      ],
    },
    // Anyja születési neve
    {
      label: "Anyja születési neve",
      key: "anyjaSzuletesiDatuma",
      alternateMatches: ["Anyja születési neve", "anyjaSzuletesiDatuma"],
      fieldType: {
        type: "input",
      },
      example: "Szent Szűz Mária",
      validations: [
        {
          rule: "required",
          errorMessage: "Anya születési neve megadása kötelező",
        },
      ],
    },
    // Tanterv
    {
      label: "Tanterv",
      key: "tanterv",
      alternateMatches: ["Tanterv", "tanterv"],
      fieldType: {
        type: "input",
      },
      example: "Technikumi képzés",
      validations: [
        {
          rule: "required",
          errorMessage: "A tanterv megadása kötelező",
        },
      ],
    },
    // Napló sorszám
    {
      label: "Napló sorszám",
      key: "naploSorszam",
      alternateMatches: ["Napló sorszám", "naploSorszam"],
      fieldType: {
        type: "input",
      },
      example: "12164218",
      validations: [
        {
          rule: "required",
          errorMessage: "A naoló sorszáma megadása kötelező",
        },
      ],
    },
    {
      label: "Nemzetiségi nevelés-oktatás",
      key: "NemzetisegiNevelesOktatas",
      alternateMatches: [
        "Nemzetiségi nevelés-oktatás",
        "NemzetisegiNevelesOktatas",
      ],
      fieldType: {
        type: "input",
      },
      example: "False",
      validations: [
        {
          rule: "required",
          errorMessage: "A Nemzetiségi nevelés-oktatás kötelező",
        },
      ],
    },
    {
      label: "Nemzetiségi nevelés-oktatás fajtája",
      key: "NemzetisegiNevelesOktatásFajtaja",
      alternateMatches: [
        "Nemzetiségi nevelés-oktatás fajtája",
        "NemzetisegiNevelesOktatásFajtaja",
      ],
      fieldType: {
        type: "input",
      },
      example: "",
      validations: [],
    },
    {
      label: "Új Szkt. - Ágazat típusa",
      key: "uj_Szkt_agazat_tipusa",
      alternateMatches: ["Új Szkt. - Ágazat típusa", "uj_Szkt_agazat_tipusa"],
      fieldType: {
        type: "input",
      },
      example: "TesztAgazatTipus",
      validations: [
        {
          rule: "required",
          errorMessage: "Az Új Szkt. - Ágazat típusa kötelező",
        },
      ],
    },
    {
      label: "Új Szkt. - Szakma típusa",
      key: "uj_szkt_szakma_tipusa",
      alternateMatches: ["Új Szkt. - Szakma típusa", "uj_szkt_szakma_tipusa"],
      fieldType: {
        type: "input",
      },
      example: "TesztSzakmaTipus",
      validations: [
        {
          rule: "required",
          errorMessage: "Az Új Szkt. - Szakma típusa kötelező",
        },
      ],
    },
    {
      label: "Új Szkt. - Szakmairány típusa",
      key: "uj_szkt_szakmairany_tipusa",
      alternateMatches: [
        "Új Szkt. - Szakmairány típusa",
        "uj_szkt_szakmairany_tipusa",
      ],
      fieldType: {
        type: "input",
      },
      example: "TesztSzakmaIranyTipus",
      validations: [
        {
          rule: "required",
          errorMessage: "Az Új Szkt. - Szakmairány típusa kötelező",
        },
      ],
    },
    {
      label: "Nkt. - Tanulmányi terület",
      key: "nkt_tanulmanyi_terulet",
      alternateMatches: ["Nkt. - Tanulmányi terület", "nkt_tanulmanyi_terulet"],
      fieldType: {
        type: "input",
      },
      example: "TesztTanulmanyiTerulet",
      validations: [
        {
          rule: "required",
          errorMessage: "Az Nkt. - Tanulmányi terület kötelező",
        },
      ],
    },
    {
      label: "Nkt. - Szakképesítés",
      key: "nkt_szakkepesites",
      alternateMatches: ["Nkt. - Szakképesítés", "nkt_szakkepesites"],
      fieldType: {
        type: "input",
      },
      example: "TesztSzekkepesites",
      validations: [
        {
          rule: "required",
          errorMessage: "Az Nkt. - Szakképesítés kötelező",
        },
      ],
    },
    {
      label: "Nkt. - Szakirány",
      key: "nkt_szakirany",
      alternateMatches: ["Nkt. - Szakirány", "nkt_szakirany"],
      fieldType: {
        type: "input",
      },
      example: "TesztSzakirany",
      validations: [
        {
          rule: "required",
          errorMessage: "Az Nkt. - Szakirány kötelező",
        },
      ],
    },
    {
      label: "Ágazat - Új Szkt. – részszakmához",
      key: "agazat_uj_szkt_reszszakmahoz",
      alternateMatches: [
        "Ágazat - Új Szkt. – részszakmához",
        "agazat_uj_szkt_reszszakmahoz",
      ],
      fieldType: {
        type: "input",
      },
      example: "TesztReszszakmahoz",
      validations: [
        {
          rule: "required",
          errorMessage: "Az Ágazat - Új Szkt. – részszakmához kötelező",
        },
      ],
    },
    {
      label: "Ágazati alapvizsga teljesítésének dátuma",
      key: "agazati_alapvizsga_teljesitesenek_datuma",
      alternateMatches: [
        "Ágazati alapvizsga teljesítésének dátuma",
        "agazati_alapvizsga_teljesitesenek_datuma",
      ],
      fieldType: {
        type: "input",
      },
      example: "2020.08.08",
      validations: [
        {
          rule: "required",
          errorMessage: "Az ágazati alapvizsga teljesítésének dátuma kötelező!",
        },
      ],
    },
    {
      label: "Ágazati alapvizsga eredménye",
      key: "agazati_alapvizsga_eredmenye",
      alternateMatches: [
        "Ágazati alapvizsga eredménye",
        "agazati_alapvizsga_eredmenye",
      ],
      fieldType: {
        type: "input",
      },
      example: "Szám",
      validations: [
        {
          rule: "required",
          errorMessage: "Az Ágazati alapvizsga eredménye kötelező!",
        },
      ],
    },
    {
      label: "Ágazati alapvizsga eredménye %",
      key: "agazati_alapvizsga_eredmenye_percent",
      alternateMatches: [
        "Ágazati alapvizsga eredménye %",
        "agazati_alapvizsga_eredmenye_percent",
      ],
      fieldType: {
        type: "input",
      },
      example: "Szám",
      validations: [
        {
          rule: "required",
          errorMessage: "Az Ágazati alapvizsga eredménye (%) kötelező!",
        },
      ],
    },
    {
      label: "Szakképzési munkaszerződéssel",
      key: "szakkepzesi_munkaszerzodessel",
      alternateMatches: [
        "Szakképzési munkaszerződéssel",
        "szakkepzesi_munkaszerzodessel",
      ],
      fieldType: {
        type: "input",
      },
      example: "False",
      validations: [
        {
          rule: "required",
          errorMessage: "Az Szakképzési munkaszerződéssel kötelező!",
        },
      ],
    },
    {
      label: "Duális képzőhely neve",
      key: "Dualis_kepzohely_neve",
      alternateMatches: ["Duális képzőhely neve", "Dualis_kepzohely_neve"],
      fieldType: {
        type: "input",
      },
      example: "False",
      validations: [
        {
          rule: "required",
          errorMessage: "A Duális képzőhely neve kötelező!",
        },
      ],
    },
    {
      label: "Duális képzőhely adószáma",
      key: "Dualis_kepzohely_adoszama",
      alternateMatches: [
        "Duális képzőhely adószáma",
        "Dualis_kepzohely_adoszama",
      ],
      fieldType: {
        type: "input",
      },
      example: "False",
      validations: [
        {
          rule: "required",
          errorMessage: "A Duális képzőhely adószáma kötelező!",
        },
      ],
    },
    {
      label: "Nemzetiségi nyelv",
      key: "nemzetisegiNyelv",
      alternateMatches: ["Nemzetiségi nyelv", "nemzetisegiNyelv"],
      fieldType: {
        type: "input",
      },
      example: "cigány",
      validations: [
        {
          rule: "required",
          errorMessage: "A nemzetiségi nyelv kötelező",
        },
      ],
    },
    {
      label: "Nemzetiség nyelvén folyó szakmai oktatás",
      key: "nemzetisegNyelvenFolyoSzakmaiOktatas",
      alternateMatches: [
        "Nemzetiség nyelvén folyó szakmai oktatás",
        "nemzetisegNyelvenFolyoSzakmaiOktatas",
      ],
      fieldType: {
        type: "input",
      },
      example: "erasmus",
      validations: [
        {
          rule: "required",
          errorMessage: "A nemzetiség nyelvén folyó szakmai oktatás kötelező",
        },
      ],
    },
    {
      label: "Sport osztály",
      key: "sportosztaly",
      alternateMatches: ["Sport osztály", "sportosztaly"],
      fieldType: {
        type: "input",
      },
      example: "box",
      validations: [
        {
          rule: "required",
          errorMessage: "A sport osztály kötelező",
        },
      ],
    },
    {
      label: "Arany János Tehetséggondozó program",
      key: "aranyjanostehetseggondozoprogram",
      alternateMatches: [
        "Arany János Tehetséggondozó program",
        "aranyjanostehetseggondozoprogram",
      ],
      fieldType: {
        type: "input",
      },
      example: "zene",
      validations: [
        {
          rule: "required",
          errorMessage: "Az Arany János Tehetséggondozó program kötelező",
        },
      ],
    },
    {
      label: "Arany János Kollégiumi Program",
      key: "arany_janos_kollegiumi_program",
      alternateMatches: [
        "Arany János Kollégiumi Program",
        "arany_janos_kollegiumi_program",
      ],
      fieldType: {
        type: "input",
      },
      example: "dohányzás",
      validations: [
        {
          rule: "required",
          errorMessage: "Az Arany János Kollégiumi Program kötelező",
        },
      ],
    },
    {
      label: "Munkarend",
      key: "munkarend",
      alternateMatches: ["Munkarend", "munkarend"],
      fieldType: {
        type: "input",
      },
      example: "duplaműszak",
      validations: [
        {
          rule: "required",
          errorMessage: "A munkarend kötelező",
        },
      ],
    },
    {
      label: "Előző intézmény",
      key: "elozo_intezmeny",
      alternateMatches: ["Előző intézmény", "elozointezmeny"],
      fieldType: {
        type: "input",
      },
      example: "false",
      validations: [
        {
          rule: "required",
          errorMessage: "Az Előző intézmény kötelező",
        },
      ],
    },
    {
      label: "Osztály1",
      key: "osztaly1",
      alternateMatches: ["Osztály1", "osztaly1"],
      fieldType: {
        type: "input",
      },
      example: "false",
      validations: [
        {
          rule: "required",
          errorMessage: "Az osztály1 megadása kötelező",
        },
      ],
    },
    {
      label: "Évfolyam",
      key: "evfolyam",
      alternateMatches: ["Évfolyam", "evfolyam"],
      fieldType: {
        type: "input",
      },
      example: "false",
      validations: [
        {
          rule: "required",
          errorMessage: "Az évfolyam megadása kötelező",
        },
      ],
    },
    {
      label: "Bizonyítvány sorszáma",
      key: "bizonyitvany_sorszama",
      alternateMatches: ["Bizonyítvány sorszáma", "bizonyitvany_sorszama"],
      fieldType: {
        type: "input",
      },
      example: "false",
      validations: [
        {
          rule: "required",
          errorMessage: "A Bizonyítvány sorszáma megadása kötelező",
        },
      ],
    },
    {
      label: "Okleveles technikus képzés",
      key: "okleveles_technikus_képzes",
      alternateMatches: [
        "Okleveles technikus képzés",
        "okleveles_technikus_képzes",
      ],
      fieldType: {
        type: "input",
      },
      example: "false",
      validations: [
        {
          rule: "required",
          errorMessage: "A Okleveles technikus képzés megadása kötelező",
        },
      ],
    },
    {
      label: "Két tanítási nyelvű",
      key: "ket_tanitasi_nyelvu",
      alternateMatches: ["Két tanítási nyelvű", "ket_tanitasi_nyelvu"],
      fieldType: {
        type: "input",
      },
      example: "false",
      validations: [
        {
          rule: "required",
          errorMessage: "A Két tanítási nyelvű megadása kötelező",
        },
      ],
    },
    {
      label: "Beírási napló sorszám",
      key: "beiras_naplo_sorszam",
      alternateMatches: ["Beírási napló sorszám", "beiras_naplo_sorszam"],
      fieldType: {
        type: "input",
      },
      example: "1",
      validations: [
        {
          rule: "required",
          errorMessage: "A Beírási napló sorszáma kötelező!",
        },
      ],
    },
    {
      label: "Felvétel tanéve",
      key: "felvetel_taneve",
      alternateMatches: ["Felvétel tanéve", "felvetel_taneve"],
      fieldType: {
        type: "input",
      },
      example: "2024/2025",
      validations: [
        {
          rule: "required",
          errorMessage: "A felvétel tanéve kötelező!",
        },
      ],
    },
    {
      label: "Törzslapszám",
      key: "torzslapszam",
      alternateMatches: ["Törzslapszám", "torzslapszam"],
      fieldType: {
        type: "input",
      },
      example: "1-2024/2025",
      validations: [
        {
          rule: "required",
          errorMessage: "A törzslapszám kötelező!",
        },
      ],
    },
    {
      label: "Tanuló jogviszonya",
      key: "tabulo_jogviszonya",
      alternateMatches: ["Tanuló jogviszonya", "tanulo_jogviszonya"],
      fieldType: {
        type: "input",
      },
      example: "Tanuló jogviszonya example",
      validations: [
        {
          rule: "required",
          errorMessage: "A Tanuló jogviszonya kötelező!",
        },
      ],
    },
    {
      label: "Jogviszony kezdete",
      key: "jogviszony_kezdete",
      alternateMatches: ["Jogviszony kezdete", "jogviszony_kezdete"],
      fieldType: {
        type: "input",
      },
      example: "2012",
      validations: [
        {
          rule: "required",
          errorMessage: "A jogviszony kezdete kötelező!",
        },
      ],
    },
    {
      label: "Jogviszony megszűnésének várható dátuma",
      key: "jogviszony_megszunesenek_varhato_datuma",
      alternateMatches: [
        "Jogviszony megszűnésének várható dátuma",
        "jogviszony_megszunesenek_varhato_datuma",
      ],
      fieldType: {
        type: "input",
      },
      example: "2024",
      validations: [
        {
          rule: "required",
          errorMessage:
            "A Jogviszony megszűnésének várható dátuma kezdete kötelező!",
        },
      ],
    },
    {
      label:
        "A 9. évfolyamosok közül a 8. évfolyamot az előző tanévben végezte",
      key: "a_9_evfolyamosok_kozul_a_8_evfolyamot_az_elozo_tanevben_vegezte",
      alternateMatches: [
        "A 9. évfolyamosok közül a 8. évfolyamot az előző tanévben végezte",
        "a_9_evfolyamosok_kozul_a_8_evfolyamot_az_elozo_tanevben_vegezte",
      ],
      fieldType: {
        type: "input",
      },
      example: "Teszt",
      validations: [
        {
          rule: "required",
          errorMessage:
            "A 9. évfolyamosok közül a 8. évfolyamot az előző tanévben végezte kötelező!",
        },
      ],
    },
    {
      label: "Kiemelten tehetséges",
      key: "kiemelten_tehetseges",
      alternateMatches: ["Kiemelten tehetséges", "kiemelten_tehetseges"],
      fieldType: {
        type: "input",
      },
      example: "Teszt",
      validations: [
        {
          rule: "required",
          errorMessage: "Kiemelten tehetséges kötelező!",
        },
      ],
    },
    {
      label: "Számítógépet tanulási/oktatási célra használ",
      key: "szamitogepet_tanulasi_oktatasi_celra_hasznal",
      alternateMatches: [
        "Számítógépet tanulási/oktatási célra használ",
        "szamitogepet_tanulasi_oktatasi_celra_hasznal",
      ],
      fieldType: {
        type: "input",
      },
      example: "Teszt",
      validations: [
        {
          rule: "required",
          errorMessage:
            "Számítógépet tanulási/oktatási célra használ kötelező!",
        },
      ],
    },
    {
      label: "Szabóky Adolf Szakképzési Ösztöndíjban részesül",
      key: "szaboky_adolf_szakkepzesi_osztondijban_reszesul",
      alternateMatches: [
        "Szabóky Adolf Szakképzési Ösztöndíjban részesül",
        "szaboky_adolf_szakkepzesi_osztondijban_reszesul",
      ],
      fieldType: {
        type: "input",
      },
      example: "Teszt",
      validations: [
        {
          rule: "required",
          errorMessage:
            "Szabóky Adolf Szakképzési Ösztöndíjban részesül kötelező!",
        },
      ],
    },
    {
      label: "Egész napos iskolai oktatásban részesül",
      key: "egesz_napos_iskolai_oktatasban_reszesul",
      alternateMatches: [
        "Egész napos iskolai oktatásban részesül",
        "egesz_napos_iskolai_oktatasban_reszesul",
      ],
      fieldType: {
        type: "input",
      },
      example: "Teszt",
      validations: [
        {
          rule: "required",
          errorMessage: "Egész napos iskolai oktatásban részesül kötelező!",
        },
      ],
    },
    {
      label: "Nyelvi előkészítő",
      key: "nyelvi_elokeszito",
      alternateMatches: ["Nyelvi előkészítő", "nyelvi_elokeszito"],
      fieldType: {
        type: "input",
      },
      example: "Teszt",
      validations: [
        {
          rule: "required",
          errorMessage: "Nyelvi előkészítő kötelező!",
        },
      ],
    },
    {
      label: "Tandíjat fizető",
      key: "tandijat_fizeto",
      alternateMatches: ["Tandíjat fizető", "tandijat_fizeto"],
      fieldType: {
        type: "input",
      },
      example: "false",
      validations: [
        {
          rule: "required",
          errorMessage: "A tandíjat fizető kötelező!",
        },
      ],
    },
    {
      label: "Térítési díjat fizető",
      key: "teritesi_dijat_fizeto",
      alternateMatches: ["Térítési díjat fizető", "teritesi_dijat_fizeto"],
      fieldType: {
        type: "input",
      },
      example: "false",
      validations: [
        {
          rule: "required",
          errorMessage: "A térítési díjat fizető kötelező!",
        },
      ],
    },
    {
      label: "Tanulószerződéses",
      key: "tanuloszerzodeses",
      alternateMatches: ["Tanulószerződéses", "tanuloszerzodeses"],
      fieldType: {
        type: "input",
      },
      example: "false",
      validations: [
        {
          rule: "required",
          errorMessage: "A tanulószerződéses kötelező!",
        },
      ],
    },
    {
      label: "Polgári szerződéses",
      key: "polgari_szerzodeses",
      alternateMatches: ["Polgári szerződéses", "polgari_szerzodeses"],
      fieldType: {
        type: "input",
      },
      example: "false",
      validations: [
        {
          rule: "required",
          errorMessage: "A polgári szerződéses kötelező!",
        },
      ],
    },
    {
      label: "Iskolai sportkörben részt vevő tanuló",
      key: "iskolai_sportkorben_reszt_vevo_tanulo",
      alternateMatches: [
        "Iskolai sportkörben részt vevő tanuló",
        "iskolai_sportkorben_reszt_vevo_tanulo",
      ],
      fieldType: {
        type: "input",
      },
      example: "false",
      validations: [
        {
          rule: "required",
          errorMessage: "Az iskolai sportkörben részt vevő tanuló kötelező!",
        },
      ],
    },
    {
      label: "Évfolyamismétlő",
      key: "evfolyamismetlo",
      alternateMatches: ["Évfolyamismétlő", "evfolyamismetlo"],
      fieldType: {
        type: "input",
      },
      example: "false",
      validations: [
        {
          rule: "required",
          errorMessage: "Az évfolyamismétlő kötelező!",
        },
      ],
    },
    {
      label: "Szakmai gyakorlaton tartózkodik",
      key: "Szakmai_gyakorlaton_tartozkodik",
      alternateMatches: [
        "Szakmai gyakorlaton tartózkodik",
        "Szakmai_gyakorlaton_tartozkodik",
      ],
      fieldType: {
        type: "input",
      },
      example: "",
      validations: [
        {
          rule: "required",
          errorMassage: "A szakmai gyakorlat állapota hiányzik!",
        },
      ],
    },

    {
      label: "Egyéni munkarend",
      key: "Egyeni_munkarend",
      alternateMatches: ["Egyéni munkarend", "Egyeni_munkarend"],
      fieldType: {
        type: "input",
      },
      example: "",
      validations: [],
    },

    {
      label: "Egyéni munkarend oka",
      key: "Egyeni_munkarend_oka",
      alternateMatches: ["Egyéni munkarend oka", "Egyeni_munkarend_oka"],
      fieldType: {
        type: "input",
      },
      example: "Teszt munkarend oka",
      validations: [],
    },

    {
      label: "Egyéni munkarend kezdete",
      key: "Egyeni_munkarend_kezdete",
      alternateMatches: [
        "Egyéni munkarend kezdete",
        "Egyeni_munkarend_kezdete",
      ],
      fieldType: {
        type: "input",
      },
      example: "2025-05-21",
      validations: [],
    },

    {
      label: "Egyéni munkarend vége",
      key: "Egyeni_munkarend_vege",
      alternateMatches: ["Egyéni munkarend vége", "Egyeni_munkarend_vege"],
      fieldType: {
        type: "input",
      },
      example: "2025-06-01",
      validations: [],
    },

    {
      label: "Vendégtanuló",
      key: "Vendegtanulo",
      alternateMatches: ["Vendégtanuló", "Vendegtanulo"],
      fieldType: {
        type: "input",
      },
      example: "",
      validations: [
        {
          rule: "required",
          errorMassage: "A vendégtanuló státusz kitöltése kötelező!",
        },
      ],
    },
    {
      label: "Szakma – részszakmához",
      key: "szakma_reszszakmahoz",
      alternateMatches: ["Szakma – részszakmához", "szakma_reszszakmahoz"],
      fieldType: { type: "input" },
      example: "na",
      validation: [
        {
          rule: "required",
          errorMesage: "Szakma – részszakmához Kötelező mező",
        },
      ],
    },
    {
      label: "Részszakma",
      key: "reszszakma",
      alternateMatches: ["Részszakma", "reszszakma"],
      fieldType: { type: "input" },
      example: "na",
      validation: [
        { rule: "required", errorMesage: "Részszakma Kötelező mező" },
      ],
    },
    {
      label: "Ágazat/Tanulmányi terület (szakiskola)",
      key: "agazat_tanulmanyi_terulet",
      alternateMatches: [
        "Ágazat/Tanulmányi terület (szakiskola)",
        "agazat_tanulmanyi_terulet",
      ],
      fieldType: { type: "input" },
      example: "!nem ismert példa! ",
    },
    {
      label: "Szakmai képzés (szakiskola)",
      key: "szakmai_kepzes",
      alternateMatches: ["Szakmai képzés (szakiskola)", "szakmai_kepzes"],
      fieldType: { type: "input" },
      example: "!nem ismert példa!",
      validation: [
        { rule: "required", errorMesage: "Szakmai képzés Kötelező mező" },
      ],
    },
    {
      label: "Ágazati alapoktatás megnevezése",
      key: "agazati_alapoktatas_megnevezese",
      alternateMatches: [
        "Ágazati alapoktatás megnevezése",
        "agazati_alapoktatas_megnevezese",
      ],
      fieldType: { type: "input" },
      example: "Müszaki ágazati alapoktatás",
      validation: [
        {
          rule: "required",
          errorMesage: "Ágazati alapoktatás megnevezése Kötelező mező",
        },
      ],
    },
    {
      label: "Ágazati alapvizsga eredmény",
      key: "agazati_alapvizsga_eredmeny",
      alternateMatches: [
        "Ágazati alapvizsga eredmény",
        "agazati_alapvizsga_eredmeny",
      ],
      fieldType: { type: "input" },
      example: "Teljesitve",
      validation: [
        { errorMesage: "Ágazati alapvizsga eredmény Kötelező mező" },
      ],
    },
  ];

  const getGroupedData = () => {
    // Check if TanugyiData exists and has items
    if (!TanugyiData || !Array.isArray(TanugyiData)) return [];

    // Group by ágazat and collect yearly counts
    const groupedByAgazat = {};
    const years = new Set(); // To track all available years

    TanugyiData.forEach((item) => {
      const agazatType = item.uj_Szkt_agazat_tipusa || "Nincs megadva";
      const year = item.createAt
        ? new Date(item.createAt).getFullYear() - 1 // FIXME: REMOVE THE - 1 IN PRODUCTION, ONLY FOR TESTING
        : "Nincs év";

      // Add this year to our set of years
      years.add(year);

      // Initialize the ágazat entry if it doesn't exist
      if (!groupedByAgazat[agazatType]) {
        groupedByAgazat[agazatType] = {
          name: agazatType,
          yearCounts: {},
        };
      }

      // Initialize or increment the count for this year
      if (!groupedByAgazat[agazatType].yearCounts[year]) {
        groupedByAgazat[agazatType].yearCounts[year] = 1;
      } else {
        groupedByAgazat[agazatType].yearCounts[year] += 1;
      }
    });

    return {
      agazatData: Object.values(groupedByAgazat),
      years: Array.from(years).sort(), // Convert to sorted array
    };
  };

  useEffect(() => {
    console.log(data);
    if (data && data?.all) {
      addTanugyiAdatok({
        alapadatok_id: "2e31291b-7c2d-4bd8-bdca-de8580136874",
        tanugyi_adatok: data.all,
      });
    }
  }, [data, addTanugyiAdatok]);

  return (
    <>
      <Button
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Feltöltés
      </Button>
      <ReactSpreadsheetImport
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        onSubmit={setData}
        fields={fields}
      />
      <div>
        <h1 style={{ fontSize: "2rem" }}>Alapadatok:</h1>
        <h2>Iskola Neve: {AlapadatokData?.iskola_neve}</h2>
        <h2>Intezmeny Tipus: {AlapadatokData?.intezmeny_tipus}</h2>

        <div>Tanuló létszáma:</div>
        <div style={{ marginTop: "2rem" }}>
          <h2>Ágazatok évenkénti megoszlása:</h2>
          {isLoading ? (
            <div>Betöltés...</div>
          ) : error ? (
            <div>Hiba történt az adatok betöltésekor</div>
          ) : (
            (() => {
              const { agazatData, years } = getGroupedData();
              return (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th
                        style={{
                          border: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "left",
                        }}
                      >
                        Ágazat típusa
                      </th>
                      {years.map((year) => (
                        <th
                          key={year}
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "center",
                          }}
                        >
                          {year} / {year + 1}
                        </th>
                      ))}
                      <th
                        style={{
                          border: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                        }}
                      >
                        Összesen
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {agazatData.map((item, index) => (
                      <tr key={index}>
                        <td
                          style={{ border: "1px solid #ddd", padding: "8px" }}
                        >
                          {item.name}
                        </td>
                        {years.map((year) => (
                          <td
                            key={year}
                            style={{
                              border: "1px solid #ddd",
                              padding: "8px",
                              textAlign: "center",
                            }}
                          >
                            {item.yearCounts[year] || 0}
                          </td>
                        ))}
                        <td
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "center",
                            fontWeight: "bold",
                          }}
                        >
                          {Object.values(item.yearCounts).reduce(
                            (sum, count) => sum + count,
                            0
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr style={{ fontWeight: "bold" }}>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        Összesen
                      </td>
                      {years.map((year) => (
                        <td
                          key={year}
                          style={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            textAlign: "center",
                          }}
                        >
                          {agazatData.reduce(
                            (sum, item) => sum + (item.yearCounts[year] || 0),
                            0
                          )}
                        </td>
                      ))}
                      <td
                        style={{
                          border: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                        }}
                      >
                        {agazatData.reduce(
                          (sum, item) =>
                            sum +
                            Object.values(item.yearCounts).reduce(
                              (s, c) => s + c,
                              0
                            ),
                          0
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              );
            })()
          )}
        </div>
      </div>
    </>
  );
}

export default App;
