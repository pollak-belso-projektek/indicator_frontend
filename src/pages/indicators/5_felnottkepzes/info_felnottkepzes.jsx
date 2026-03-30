import { Typography, Box } from "@mui/material";

/**
 * Info component for Felnőttképzés (Adult Education) indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoFelnottkepzes = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body1" color="text.secondary">
        Az indikátor információt nyújt, hogy az intézmény milyen mértékben támogatja 
        az élethosszig tartó tanulás céljait. Biztosítja-e, hogy az általa képzett 
        alapszakmákhoz való hozzáférés minél szélesebb körű legyen.
        <br />
        <strong>
          A mutató számítása: Felnőttképzési jogviszonyú tanulók aránya = 
          (felnőttképzési jogviszonnyal résztvevők száma / szakmai oktatásban résztvevők száma) * 100
        </strong>
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Az indikátor információt nyújt, hogy az intézmény milyen mértékben támogatja az 
        élethosszig tartó tanulás céljait. Biztosítja-e, hogy az általa képzett 
        alapszakmákhoz való hozzáférés minél szélesebb körű legyen.
        <br />
        Adatforrás: A szakképző intézményben adott tanév október 1-jén szakmai oktatásban 
        tanulók száma: KRÉTA. A szakképző intézményben adott tanév október 1-jén szakmai 
        oktatásban felnőttképzési jogviszonnyal tanulók száma: KRÉTA.
      </Typography>
    </Box>
  );
};

export default InfoFelnottkepzes;
