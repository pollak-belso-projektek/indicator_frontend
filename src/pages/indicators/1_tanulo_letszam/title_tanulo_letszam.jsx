import SchoolIcon from "@mui/icons-material/School";
import IndicatorTitle from "../../../components/shared/IndicatorTitle";

const TitleTanuloLetszam = () => {
  return (
    <IndicatorTitle
      icon={SchoolIcon}
      title="1. Tanulólétszám"
      description="A szakképző intézményben adott tanév október 1-jén szakmai oktatásban (tanulói jogviszonyban és felnőttképzési jogviszonyban) tanulók száma."
    />
  );
};

export default TitleTanuloLetszam;
