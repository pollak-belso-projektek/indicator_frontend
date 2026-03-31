import { Typography, Box } from "@mui/material";

/**
 * Info component for Elhelyezkedési mutató (Employment Rate) indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoElhelyezkedesiMutato = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
        A szakmai oktatásban sikeresen végzettek elhelyezkedési aránya.     
        <br />
        <strong>
          A mutató számítása: Szakmai oktatásban végzettek elhelyezkedési aránya = (elhelyezkedők száma / szakmai oktatásban sikeresen végzettek száma) * 100
        </strong>
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Adatot szolgáltat, hogy a sikeresen végzett tanulók milyen arányban tanulnak 
        tovább vagy helyezkednek el a munkaerőpiacon. Segíti az intézményeket jövőbeni 
        képzési kínálatuk alakításában.
        <br />
        Adatforrás: Szakmai oktatásban sikeresen végzett tanulók száma: KRÉTA.
    </Typography>
    </Box>
  );
};

export default InfoElhelyezkedesiMutato;
