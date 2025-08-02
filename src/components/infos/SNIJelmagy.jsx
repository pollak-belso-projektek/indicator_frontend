import { Chip, Stack, Typography } from "@mui/material";

const SNIJelmagy = () => {
  return (
    <>
      <Typography variant="h6" component="h3" gutterBottom>
        Jelmagyarázat
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }} flexWrap="wrap">
        <Chip
          label="SNI tanulók"
          variant="outlined"
          sx={{ backgroundColor: "#fff3cd" }}
        />
        <Chip
          label="Összes tanuló"
          variant="outlined"
          sx={{ backgroundColor: "#d4edda" }}
        />
        <Chip
          label="SNI arány"
          variant="outlined"
          sx={{ backgroundColor: "#cce5ff" }}
        />
      </Stack>
      <Typography variant="body2">
        A táblázat a sajátos nevelési igényű tanulók arányát jeleníti meg
        iskolák és tanévek szerint. Az arány automatikusan számítódik az SNI és
        összes tanuló létszám alapján. Az adatok szakértői bizottság véleményén
        alapulnak.
      </Typography>
    </>
  );
};

export default SNIJelmagy;
