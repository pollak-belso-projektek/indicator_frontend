export const employeeFields = [
  {
    label: "Vezetéknév",
    key: "vezeteknev",
    alternateMatches: ["Vezetéknév", "vezeteknev", "Családnév"],
    fieldType: {
      type: "input",
    },
    example: "Kovács",
    validations: [
      {
        rule: "required",
        errorMessage: "A Vezetéknév kötelező",
      },
    ],
  },
  {
    label: "Keresztnév",
    key: "keresztnev",
    alternateMatches: ["Keresztnév", "keresztnev", "Utónév", "utonev"],
    fieldType: {
      type: "input",
    },
    example: "Anna",
    validations: [
      {
        rule: "required",
        errorMessage: "A Keresztnév kötelező",
      },
    ],
  },
  {
    label: "Munkakör",
    key: "munkakor",
    alternateMatches: [
      "Munkakör",
      "munkakor",
      "Beosztás",
      "beosztás",
      "Pozíció",
    ],
    fieldType: {
      type: "input",
    },
    example: "oktató",
    validations: [
      {
        rule: "required",
        errorMessage: "A Munkakör kötelező",
      },
    ],
  },
  {
    label: "Munkakör jellege",
    key: "munkakor_jellege",
    alternateMatches: [
      "Munkakör jellege",
      "munkakor_jellege",
      "Foglalkoztatás jellege",
    ],
    fieldType: {
      type: "select",
      options: [
        { value: "teljes_idős", label: "Teljes idős" },
        { value: "részmunkaidős", label: "Részmunkaidős" },
        { value: "megbízásos", label: "Megbízásos" },
      ],
    },
    example: "teljes_idős",
    validations: [],
  },
  {
    label: "Pedagógus szakvizsga",
    key: "pedagogus_szakvizsga",
    alternateMatches: [
      "Pedagógus szakvizsga",
      "pedagogus_szakvizsga",
      "Szakvizsga",
    ],
    fieldType: {
      type: "select",
      options: [
        { value: "igen", label: "Igen" },
        { value: "nem", label: "Nem" },
        { value: "folyamatban", label: "Folyamatban" },
      ],
    },
    example: "igen",
    validations: [],
  },
  {
    label: "Legmagasabb iskolai végzettség",
    key: "legmagasabb_vegzettseg",
    alternateMatches: [
      "Legmagasabb iskolai végzettség",
      "legmagasabb_vegzettseg",
      "Végzettség",
      "Iskolai végzettség",
    ],
    fieldType: {
      type: "select",
      options: [
        { value: "alapfokú", label: "Alapfokú" },
        { value: "középfokú", label: "Középfokú" },
        { value: "felsőfokú", label: "Felsőfokú" },
        { value: "doktori", label: "Doktori" },
      ],
    },
    example: "felsőfokú",
    validations: [],
  },
  {
    label: "Szakirányú végzettség",
    key: "szakiranyu_vegzettseg",
    alternateMatches: [
      "Szakirányú végzettség",
      "szakiranyu_vegzettseg",
      "Szakképzettség",
    ],
    fieldType: {
      type: "input",
    },
    example: "Tanári végzettség",
    validations: [],
  },
  {
    label: "Tantárgy",
    key: "tantargy",
    alternateMatches: ["Tantárgy", "tantargy", "Szaktárgy"],
    fieldType: {
      type: "input",
    },
    example: "Matematika",
    validations: [],
  },
  {
    label: "Tapasztalat (év)",
    key: "tapasztalat_ev",
    alternateMatches: [
      "Tapasztalat (év)",
      "tapasztalat_ev",
      "Szolgálati idő",
      "Munkatapasztalat",
    ],
    fieldType: {
      type: "input",
    },
    example: "15",
    validations: [
      {
        rule: "regex",
        value: "^[0-9]+$",
        errorMessage: "A tapasztalat csak szám lehet",
      },
    ],
  },
  {
    label: "Születési dátum",
    key: "szuletesi_datum",
    alternateMatches: ["Születési dátum", "szuletesi_datum", "Születési idő"],
    fieldType: {
      type: "input",
    },
    example: "1985-06-15",
    validations: [
      {
        rule: "regex",
        value: "^[0-9]{4}-[0-9]{2}-[0-9]{2}$",
        errorMessage: "A dátum formátuma YYYY-MM-DD legyen",
      },
    ],
  },
  {
    label: "Belépés dátuma",
    key: "belepes_datuma",
    alternateMatches: [
      "Belépés dátuma",
      "belepes_datuma",
      "Munkaviszony kezdete",
    ],
    fieldType: {
      type: "input",
    },
    example: "2020-09-01",
    validations: [
      {
        rule: "regex",
        value: "^[0-9]{4}-[0-9]{2}-[0-9]{2}$",
        errorMessage: "A dátum formátuma YYYY-MM-DD legyen",
      },
    ],
  },
  {
    label: "Státusz",
    key: "statusz",
    alternateMatches: ["Státusz", "statusz", "Állapot"],
    fieldType: {
      type: "select",
      options: [
        { value: "aktív", label: "Aktív" },
        { value: "inaktív", label: "Inaktív" },
        { value: "szüneten", label: "Szüneten" },
        { value: "kilépett", label: "Kilépett" },
      ],
    },
    example: "aktív",
    validations: [],
  },
  {
    label: "Email cím",
    key: "email_cim",
    alternateMatches: ["Email cím", "email_cim", "E-mail", "Email"],
    fieldType: {
      type: "input",
    },
    example: "kovacs.anna@iskola.hu",
    validations: [
      {
        rule: "regex",
        value: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$",
        errorMessage: "Érvényes email címet adjon meg",
      },
    ],
  },
  {
    label: "Telefon",
    key: "telefon",
    alternateMatches: ["Telefon", "telefon", "Telefonszám"],
    fieldType: {
      type: "input",
    },
    example: "+36 30 123 4567",
    validations: [],
  },
];

/**
 * Filters employee data to include only records where job title contains "oktató"
 * @param {Array} data - Raw employee data
 * @returns {Array} - Filtered data containing only teachers
 */
export const filterTeacherData = (data) => {
  return data.filter((employee) => {
    const jobTitle = employee.munkakor || employee.Munkakör || "";
    return jobTitle.toLowerCase().includes("oktató");
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
      newItem[field.key] = item[field.label] || "";
    });
    return newItem;
  });
};
