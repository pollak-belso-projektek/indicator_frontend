import PersonIcon from "@mui/icons-material/Person";
import IndicatorTitle from "../../../components/shared/IndicatorTitle";

const TitleOktatoPerDiak = () => {
  return (
    <IndicatorTitle
      icon={PersonIcon}
      title="3. Oktatóra jutó diák"
      description="Az egy oktatóra jutó tanulók száma az intézményben szakmánként és képzési formánként"
    />
  );
};

export default TitleOktatoPerDiak;
