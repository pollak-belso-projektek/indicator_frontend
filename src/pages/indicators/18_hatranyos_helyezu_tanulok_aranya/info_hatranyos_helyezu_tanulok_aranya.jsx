import { Typography, Box } from "@mui/material";

/**
 * Info component for HH és HHH tanulók aránya indicator
 * Used with PageWrapper's infoContent prop
 */
const InfoHatranyosHelyzetu = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" color="text.secondary">
        Ez az oldal a hátrányos helyzetű (HH) és halmozottan hátrányos helyzetű
        (HHH) tanulók adatait tartalmazza.
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        <Typography component="li" variant="body2" color="text.secondary">
          <strong>A mutató számítása: </strong> HH tanulók aránya = (HH tanulók száma / tanulói létszám) * 100, illetve HHH tanulók aránya = (HHH tanulók száma / tanulói létszám) * 100
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Példa: Adott tanévben a jogviszonnyal rendelkező tanulók létszáma (tanulói összlétszám) 1024 fő. 
          A hátrányos helyzetű tanulók száma ugyanebben a tanévben 77 fő.
          A mutató számítása tehát (77 fő / 1024 fő) * 100 = 7,52%.
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          A hátrányos helyzetű csoportok számára elérhetők az intézmény által kínált képzések.
          Az intézmény működési környezetét, helyzetét is megmutatja a mutató.
        </Typography>
        <Typography component="li" variant="body2" color="text.secondary">
          Adatforrás: Jogviszonnyal rendelkező tanulók (tanulói és felnőttképzési) október 1-jei létszáma: KRÉTA. <br />
          Hátrányos helyzetű tanulók száma október 1-jén: KRÉTA.
        </Typography>        
      </Box>
    </Box>
  );
};

export default InfoHatranyosHelyzetu;
