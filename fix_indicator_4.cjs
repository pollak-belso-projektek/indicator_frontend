const fs = require("fs");
const file = "src/pages/indicators/4_szakkepzesi_munkaszerződes_arany/SzakképzésiMunkaszerződésArány.jsx";
let content = fs.readFileSync(file, "utf-8");

// Add imports
if (!content.includes("Accordion,")) {
  content = content.replace(
    /Card,\s*CardContent,\s*Typography,/,
    `Accordion,\n  AccordionSummary,\n  AccordionDetails,\n  Card,\n  CardContent,\n  Typography,`
  );
}

if (!content.includes("ExpandMoreIcon")) {
  content = content.replace(
    /Refresh as RefreshIcon,/,
    `Refresh as RefreshIcon,\n  ExpandMore as ExpandMoreIcon,`
  );
}

// Fix shouldInitialize
content = content.replace(
  /const isSZMSZDataReady = szmszData && Array\.isArray\(szmszData\);\s*const isStudentDataReady = data && Array\.isArray\(data\);\s*const shouldInitialize =\s*!isModified &&\s*\(\(!hasInitializedFromAPI && \(isSZMSZDataReady \|\| isStudentDataReady\)\) \|\|\s*\(hasInitializedFromAPI && !initializedWithSZMSZ && hasSZMSZData\)\);/,
  `// We use isFetching to know when the APIs have returned, successfully or not.
    const queriesFinished = !isFetchingSzmsz && !isFetchingData;
    const shouldInitialize =
      !isModified &&
      ((!hasInitializedFromAPI && queriesFinished) ||
        (hasInitializedFromAPI && !initializedWithSZMSZ && hasSZMSZData));`
);

// Add dependencies to useEffect
content = content.replace(
  /    data,\n    szmszData,\n    institutionStructure,\n    schoolYears,\n    hasInitializedFromAPI,\n    initializedWithSZMSZ,\n    isModified,\n    structureInitialized,\n    shouldProcessAPIData,\n  \]\);/,
  `    data,\n    szmszData,\n    institutionStructure,\n    schoolYears,\n    hasInitializedFromAPI,\n    initializedWithSZMSZ,\n    isModified,\n    structureInitialized,\n    shouldProcessAPIData,\n    isFetchingSzmsz,\n    isFetchingData,\n  ]);`
);


// Fix the renderTableSection to use Accordion
const tableSectionRegex = /const renderTableSection = \(dataKey, title, unit, bgColor\) => \{\s*return \(\s*<Card sx=\{\{ mb: 3 \}\}>\s*<CardContent>\s*<Typography\s*variant="h6"\s*component="h2"\s*gutterBottom\s*sx=\{\{\s*color: dataKey === "percentage" \? "#d32f2f" : "#1976d2",\s*fontWeight: "bold",\s*textAlign: "center",\s*\}\}\s*>\s*\{title\}\s*<\/Typography>/;

if (tableSectionRegex.test(content)) {
  content = content.replace(tableSectionRegex, 
    `const renderTableSection = (dataKey, title, unit, bgColor) => {
    return (
      <Accordion sx={{ mb: 3 }} defaultExpanded={false}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography
            variant="h6"
            component="h2"
            sx={{
              color: dataKey === "percentage" ? "#d32f2f" : "#1976d2",
              fontWeight: "bold",
            }}
          >
            {title}
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <Card sx={{ boxShadow: "none", border: "none", borderRadius: 0 }}>
            <CardContent>`
  );
  
  content = content.replace(
    /<\/TableContainer>\s*<\/CardContent>\s*<\/Card>\s*\);\s*\};/g,
    `</TableContainer>\n            </CardContent>\n          </Card>\n        </AccordionDetails>\n      </Accordion>\n    );\n  };`
  );
  
  fs.writeFileSync(file, content);
  console.log("Successfully updated SzakképzésiMunkaszerződésArány.jsx");
} else {
  console.log("Regex didn't match for renderTableSection");
}
