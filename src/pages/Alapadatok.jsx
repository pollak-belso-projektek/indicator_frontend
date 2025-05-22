import { Spinner } from "@chakra-ui/react";
import { useGetAlapadatokQuery } from "../store/api/apiSlice";

export default function Alapadatok() {
  const { data, error, isLoading } = useGetAlapadatokQuery({
    id: "2e31291b-7c2d-4bd8-bdca-de8580136874",
  });

  return isLoading ? (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "90vh",
      }}
    >
      <Spinner size="xl" />
    </div>
  ) : error ? (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "90vh",
      }}
    >
      <h1 style={{ color: "red" }}>Hiba történt az adatok betöltésekor!</h1>
    </div>
  ) : !data ? (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "90vh",
      }}
    >
      <h1 style={{ color: "red" }}>Nincsenek elérhető adatok!</h1>
    </div>
  ) : (
    <div>
      <h1>Alapadatok</h1>
      <h2>Iskola Neve: {data.iskola_neve}</h2>
      <h2>Intezmeny Tipus: {data.intezmeny_tipus}</h2>
    </div>
  );
}
