export const employeeFields = [
  {
    label: "Előtag",
    key: "Elotag",
    alternateMatches: ["Előtag", "Elotag", "Titulus"],
    fieldType: {
      type: "input",
    },
    example: "Dr.",
    validations: [],
  },
  {
    label: "Vezetéknév",
    key: "Vezeteknev",
    alternateMatches: ["Vezetéknév", "Vezeteknev", "Családnév"],
    fieldType: {
      type: "input",
    },
    example: "Nagy",
    validations: [
      {
        rule: "required",
        errorMessage: "A Vezetéknév kötelező",
      },
    ],
  },
  {
    label: "Utónév",
    key: "Utonev",
    alternateMatches: ["Utónév", "Utonev", "Keresztnév"],
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
    label: "Alkalmazott teljes neve",
    key: "AlkalmazottTeljesNeve",
    alternateMatches: [
      "Alkalmazott teljes neve",
      "AlkalmazottTeljesNeve",
      "Teljes név",
    ],
    fieldType: {
      type: "input",
    },
    example: "Dr. Nagy János",
    validations: [],
  },
  {
    label: "Pedagógus oktatási azonosító",
    key: "PedagogusOkatatasiAzonosito",
    alternateMatches: [
      "Pedagógus oktatási azonosító",
      "PedagogusOkatatasiAzonosito",
      "POA",
    ],
    fieldType: {
      type: "input",
    },
    example: "PED123456",
    validations: [],
  },
  {
    label: "Tanév kezdete",
    key: "TanevKezdete",
    alternateMatches: ["Tanév kezdete", "TanevKezdete", "Tanév"],
    fieldType: {
      type: "input",
    },
    example: "2024",
    validations: [
      {
        rule: "regex",
        value: "^[0-9]{4}$",
        errorMessage: "A tanév kezdete YYYY formátumú legyen",
      },
    ],
  },
  {
    label: "Pedagógus fokozat",
    key: "PedagogusFokozat",
    alternateMatches: ["Pedagógus fokozat", "PedagogusFokozat", "Fokozat"],
    fieldType: {
      type: "select",
      options: [
        { value: "Alapfokozat", label: "Alapfokozat" },
        { value: "Mesterfokozat", label: "Mesterfokozat" },
        { value: "Doktori fokozat", label: "Doktori fokozat" },
      ],
    },
    example: "Mesterfokozat",
    validations: [],
  },
  {
    label: "Munkakör",
    key: "Munkakor",
    alternateMatches: ["Munkakör", "Munkakor", "Beosztás", "Pozíció"],
    fieldType: {
      type: "input",
    },
    example: "Tanár",
    validations: [
      {
        rule: "required",
        errorMessage: "A Munkakör kötelező",
      },
    ],
  },
  {
    label: "Foglalkoztatási jogviszony",
    key: "FoglalkoztatasiJogviszony",
    alternateMatches: [
      "Foglalkoztatási jogviszony",
      "FoglalkoztatasiJogviszony",
      "Jogviszony",
    ],
    fieldType: {
      type: "select",
      options: [
        { value: "Határozatlan idejű", label: "Határozatlan idejű" },
        { value: "Határozott idejű", label: "Határozott idejű" },
        { value: "Megbízásos", label: "Megbízásos" },
      ],
    },
    example: "Határozatlan idejű",
    validations: [],
  },
  {
    label: "Kötelező óraszáma",
    key: "KotelezoOraszama",
    alternateMatches: [
      "Kötelező óraszáma",
      "KotelezoOraszama",
      "Kötelező órák",
    ],
    fieldType: {
      type: "input",
    },
    example: "22",
    validations: [
      {
        rule: "regex",
        value: "^[0-9]+$",
        errorMessage: "A kötelező óraszám csak szám lehet",
      },
    ],
  },
  {
    label: "Óraszám",
    key: "Oraszam",
    alternateMatches: ["Óraszám", "Oraszam", "Tényleges óraszám"],
    fieldType: {
      type: "input",
    },
    example: "22.5",
    validations: [
      {
        rule: "regex",
        value: "^[0-9]+(\\.[0-9]+)?$",
        errorMessage: "Az óraszám szám legyen (tizedesjegy is megengedett)",
      },
    ],
  },
  {
    label: "Alkalmazás kezdete",
    key: "AlkalmazasKezdete",
    alternateMatches: [
      "Alkalmazás kezdete",
      "AlkalmazasKezdete",
      "Munkaviszony kezdete",
    ],
    fieldType: {
      type: "input",
    },
    example: "2024-09-01 vagy 2024-09-01T00:00:00Z",
    validations: [
      {
        rule: "regex",
        value:
          "^([0-9]{4}-[0-9]{2}-[0-9]{2}(T[0-9]{2}:[0-9]{2}:[0-9]{2}(\\.?[0-9]+)?Z?)?|[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\\.[0-9]{3}Z)$",
        errorMessage:
          "A dátum formátuma YYYY-MM-DD vagy YYYY-MM-DDTHH:mm:ssZ legyen",
      },
    ],
  },
  {
    label: "Alkalmazás vége",
    key: "AlkalmazasVege",
    alternateMatches: [
      "Alkalmazás vége",
      "AlkalmazasVege",
      "Munkaviszony vége",
    ],
    fieldType: {
      type: "input",
    },
    example: "2025-06-30 vagy 2025-06-30T00:00:00Z",
    validations: [
      {
        rule: "regex",
        value:
          "^([0-9]{4}-[0-9]{2}-[0-9]{2}(T[0-9]{2}:[0-9]{2}:[0-9]{2}(\\.?[0-9]+)?Z?)?|[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\\.[0-9]{3}Z)$",
        errorMessage:
          "A dátum formátuma YYYY-MM-DD vagy YYYY-MM-DDTHH:mm:ssZ legyen",
      },
    ],
  },
  // Additional fields from Prisma model
  {
    label: "Utazó gyógypedagógus",
    key: "UtazoGyogypedagogus",
    alternateMatches: ["Utazó gyógypedagógus", "UtazoGyogypedagogus"],
    fieldType: {
      type: "select",
      options: [
        { value: "igen", label: "Igen" },
        { value: "nem", label: "Nem" },
      ],
    },
    example: "nem",
    validations: [],
  },
  {
    label: "Foglalkoztatás típusa",
    key: "FoglalkoztatasTipusa",
    alternateMatches: ["Foglalkoztatás típusa", "FoglalkoztatasTipusa"],
    fieldType: {
      type: "input",
    },
    example: "Teljes munkaidő",
    validations: [],
  },
  {
    label: "Vezetői óraszám oka",
    key: "VezetoiOraszamOka",
    alternateMatches: ["Vezetői óraszám oka", "VezetoiOraszamOka"],
    fieldType: {
      type: "input",
    },
    example: "",
    validations: [],
  },
  {
    label: "Feladattal terhelt óraszám",
    key: "FeladattalTerheltOraszam",
    alternateMatches: [
      "Feladattal terhelt óraszám",
      "FeladattalTerheltOraszam",
    ],
    fieldType: {
      type: "input",
    },
    example: "0.00",
    validations: [
      {
        rule: "regex",
        value: "^[0-9]+(\\.[0-9]+)?$",
        errorMessage: "Az óraszám szám legyen (tizedesjegy is megengedett)",
      },
    ],
  },
  {
    label: "Pedagógus heti óraszáma",
    key: "PedagogusHetiOraszama",
    alternateMatches: ["Pedagógus heti óraszáma", "PedagogusHetiOraszama"],
    fieldType: {
      type: "input",
    },
    example: "0.00",
    validations: [
      {
        rule: "regex",
        value: "^[0-9]+(\\.[0-9]+)?$",
        errorMessage: "Az óraszám szám legyen (tizedesjegy is megengedett)",
      },
    ],
  },
  {
    label: "Csökkentett munkaidős",
    key: "CsokkentettMunkaidos",
    alternateMatches: ["Csökkentett munkaidős", "CsokkentettMunkaidos"],
    fieldType: {
      type: "select",
      options: [
        { value: "igen", label: "Igen" },
        { value: "nem", label: "Nem" },
      ],
    },
    example: "nem",
    validations: [],
  },
  {
    label: "Tartósan távollévő",
    key: "TartosanTavollevo",
    alternateMatches: ["Tartósan távollévő", "TartosanTavollevo"],
    fieldType: {
      type: "select",
      options: [
        { value: "igen", label: "Igen" },
        { value: "nem", label: "Nem" },
      ],
    },
    example: "nem",
    validations: [],
  },
  {
    label: "Nyugdíjas",
    key: "Nyugdijas",
    alternateMatches: ["Nyugdíjas", "Nyugdijas"],
    fieldType: {
      type: "select",
      options: [
        { value: "igen", label: "Igen" },
        { value: "nem", label: "Nem" },
      ],
    },
    example: "nem",
    validations: [],
  },
  {
    label: "Betöltetlen álláshely",
    key: "BetoltetlenAllashely",
    alternateMatches: ["Betöltetlen álláshely", "BetoltetlenAllashely"],
    fieldType: {
      type: "select",
      options: [
        { value: "igen", label: "Igen" },
        { value: "nem", label: "Nem" },
      ],
    },
    example: "nem",
    validations: [],
  },
  {
    label: "Külső alkalmazott",
    key: "KulsoAlkalmazott",
    alternateMatches: ["Külső alkalmazott", "KulsoAlkalmazott"],
    fieldType: {
      type: "select",
      options: [
        { value: "igen", label: "Igen" },
        { value: "nem", label: "Nem" },
      ],
    },
    example: "nem",
    validations: [],
  },
  {
    label: "Főállású",
    key: "Foallasu",
    alternateMatches: ["Főállású", "Foallasu"],
    fieldType: {
      type: "select",
      options: [
        { value: "igen", label: "Igen" },
        { value: "nem", label: "Nem" },
      ],
    },
    example: "igen",
    validations: [],
  },
  {
    label: "Szabad álláshely",
    key: "SzabadAllashely",
    alternateMatches: ["Szabad álláshely", "SzabadAllashely"],
    fieldType: {
      type: "select",
      options: [
        { value: "igen", label: "Igen" },
        { value: "nem", label: "Nem" },
      ],
    },
    example: "nem",
    validations: [],
  },
  {
    label: "Szakértői vagy vizsgaelnöki tevékenységű",
    key: "SzakertoiVagyVizsgaelnokiTevekenysegu",
    alternateMatches: [
      "Szakértői vagy vizsgaelnöki tevékenységű",
      "SzakertoiVagyVizsgaelnokiTevekenysegu",
    ],
    fieldType: {
      type: "select",
      options: [
        { value: "igen", label: "Igen" },
        { value: "nem", label: "Nem" },
      ],
    },
    example: "nem",
    validations: [],
  },
  {
    label: "Szakvizsga",
    key: "Szakvizsga",
    alternateMatches: ["Szakvizsga", "Szakvizsga"],
    fieldType: {
      type: "select",
      options: [
        { value: "igen", label: "Igen" },
        { value: "nem", label: "Nem" },
        { value: "folyamatban", label: "Folyamatban" },
      ],
    },
    example: "nem",
    validations: [],
  },
  {
    label: "Szakértő szaktanácsadó",
    key: "SzakertoSzaktanacsado",
    alternateMatches: ["Szakértő szaktanácsadó", "SzakertoSzaktanacsado"],
    fieldType: {
      type: "select",
      options: [
        { value: "igen", label: "Igen" },
        { value: "nem", label: "Nem" },
      ],
    },
    example: "nem",
    validations: [],
  },
  {
    label: "SZTSZ szám",
    key: "SZTSZSzam",
    alternateMatches: ["SZTSZ szám", "SZTSZSzam"],
    fieldType: {
      type: "input",
    },
    example: "",
    validations: [],
  },
  {
    label: "Feladatellátási hely",
    key: "FeladatellatasiHely",
    alternateMatches: ["Feladatellátási hely", "FeladatellatasiHely"],
    fieldType: {
      type: "input",
    },
    example: "",
    validations: [],
  },
  {
    label: "Képesítés",
    key: "Kepesites",
    alternateMatches: ["Képesítés", "Kepesites"],
    fieldType: {
      type: "input",
    },
    example: "",
    validations: [],
  },
  {
    label: "Internetet oktatási célra használ",
    key: "InternetetOktatasiCelraHsznal",
    alternateMatches: [
      "Internetet oktatási célra használ",
      "InternetetOktatasiCelraHsznal",
    ],
    fieldType: {
      type: "select",
      options: [
        { value: "igen", label: "Igen" },
        { value: "nem", label: "Nem" },
      ],
    },
    example: "nem",
    validations: [],
  },
  {
    label: "Informatikai képesítéssel/ismeretekkel rendelkezik",
    key: "InformatikaiKepesitesselIsmeretekkelRendelkezik",
    alternateMatches: [
      "Informatikai képesítéssel/ismeretekkel rendelkezik",
      "InformatikaiKepesitesselIsmeretekkelRendelkezik",
    ],
    fieldType: {
      type: "select",
      options: [
        { value: "igen", label: "Igen" },
        { value: "nem", label: "Nem" },
      ],
    },
    example: "nem",
    validations: [],
  },
  {
    label: "IKT eszközöket a tanórája legalább 40%-ában használja",
    key: "IKTEszkozoketATanorajaLegalabb40abanHasznalja",
    alternateMatches: [
      "IKT eszközöket a tanórája legalább 40%-ában használja",
      "IKTEszkozoketATanorajaLegalabb40abanHasznalja",
    ],
    fieldType: {
      type: "select",
      options: [
        { value: "igen", label: "Igen" },
        { value: "nem", label: "Nem" },
      ],
    },
    example: "nem",
    validations: [],
  },
  {
    label: "Apáczai mentor",
    key: "ApaczaiMentor",
    alternateMatches: ["Apáczai mentor", "ApaczaiMentor"],
    fieldType: {
      type: "select",
      options: [
        { value: "igen", label: "Igen" },
        { value: "nem", label: "Nem" },
      ],
    },
    example: "nem",
    validations: [],
  },
];

/**
 * Filters employee data to include only records where job title contains "oktató" or "tanár"
 * @param {Array} data - Raw employee data
 * @returns {Array} - Filtered data containing only teachers
 */
export const filterTeacherData = (data) => {
  return data.filter((employee) => {
    const jobTitle = employee.Munkakor || employee.munkakor || "";
    return (
      jobTitle.toLowerCase().includes("oktató") ||
      jobTitle.toLowerCase().includes("tanár")
    );
  });
};

/**
 * Maps uploaded data to the correct field structure
 * @param {Array} uploadedData - Data from Excel/CSV upload
 * @returns {Array} - Mapped data with correct field keys
 */
export const mapEmployeeData = (uploadedData) => {
  return uploadedData.map((item) => {
    const newItem = {};
    employeeFields.forEach((field) => {
      // Próbáljuk megtalálni az értéket a különböző lehetséges kulcsokkal
      let value = item[field.label];
      if (!value) {
        // Ha a label alapján nem található, próbáljuk az alternateMatches-eket
        for (const altMatch of field.alternateMatches) {
          if (item[altMatch]) {
            value = item[altMatch];
            break;
          }
        }
      }
      newItem[field.key] = value || "";
    });

    // Típus konverziók a Prisma model alapján

    // Integer mezők konverziója
    if (newItem.TanevKezdete) {
      newItem.TanevKezdete = parseInt(newItem.TanevKezdete) || 2024;
    } else {
      newItem.TanevKezdete = 2024;
    }

    if (newItem.KotelezoOraszama) {
      // Eltávolítjuk a whitespace-eket és konvertáljuk
      newItem.KotelezoOraszama =
        parseInt(String(newItem.KotelezoOraszama).trim()) || 0;
    } else {
      newItem.KotelezoOraszama = 0;
    }

    // Decimal mezők konverziója
    if (newItem.Oraszam) {
      newItem.Oraszam = parseFloat(String(newItem.Oraszam).trim()) || 0.0;
    } else {
      newItem.Oraszam = 0.0;
    }

    if (newItem.FeladattalTerheltOraszam) {
      newItem.FeladattalTerheltOraszam =
        parseFloat(String(newItem.FeladattalTerheltOraszam).trim()) || 0.0;
    } else {
      newItem.FeladattalTerheltOraszam = 0.0;
    }

    if (newItem.PedagogusHetiOraszama) {
      newItem.PedagogusHetiOraszama =
        parseFloat(String(newItem.PedagogusHetiOraszama).trim()) || 0.0;
    } else {
      newItem.PedagogusHetiOraszama = 0.0;
    }

    // Dátum mezők konverziója és alapértelmezése
    if (newItem.AlkalmazasKezdete) {
      // Ha csak dátum formátum (YYYY-MM-DD), akkor kiegészítjük idővel és timezone-nal
      if (/^\d{4}-\d{2}-\d{2}$/.test(newItem.AlkalmazasKezdete)) {
        newItem.AlkalmazasKezdete = newItem.AlkalmazasKezdete + "T00:00:00Z";
      }
      // Ha már teljes ISO formátum, de nincs Z a végén, hozzáadjuk
      else if (
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(newItem.AlkalmazasKezdete)
      ) {
        newItem.AlkalmazasKezdete = newItem.AlkalmazasKezdete + "Z";
      }
      // Ellenőrizzük, hogy valid ISO dátum-e
      try {
        new Date(newItem.AlkalmazasKezdete).toISOString();
      } catch (e) {
        newItem.AlkalmazasKezdete = new Date().toISOString();
      }
    } else {
      newItem.AlkalmazasKezdete = new Date().toISOString();
    }

    if (newItem.AlkalmazasVege) {
      // Ha csak dátum formátum (YYYY-MM-DD), akkor kiegészítjük idővel és timezone-nal
      if (/^\d{4}-\d{2}-\d{2}$/.test(newItem.AlkalmazasVege)) {
        newItem.AlkalmazasVege = newItem.AlkalmazasVege + "T23:59:59Z";
      }
      // Ha már teljes ISO formátum, de nincs Z a végén, hozzáadjuk
      else if (
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(newItem.AlkalmazasVege)
      ) {
        newItem.AlkalmazasVege = newItem.AlkalmazasVege + "Z";
      }
      // Ellenőrizzük, hogy valid ISO dátum-e
      try {
        new Date(newItem.AlkalmazasVege).toISOString();
      } catch (e) {
        newItem.AlkalmazasVege = new Date().toISOString();
      }
    } else {
      newItem.AlkalmazasVege = new Date().toISOString();
    }

    return newItem;
  });
};
