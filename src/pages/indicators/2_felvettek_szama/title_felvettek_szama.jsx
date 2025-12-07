import GroupAddIcon from "@mui/icons-material/GroupAdd";
import IndicatorTitle from "../../../components/shared/IndicatorTitle";

const TitleFelvettekSzama = () => {
  return (
    <IndicatorTitle
      icon={GroupAddIcon}
      title="2. Felvettek száma"
      description="A szakképző intézménybe az adott tanévben felvett tanulók száma képzési formánként és szakmánként"
    />
  );
};

export default TitleFelvettekSzama;
