import EventBusyIcon from "@mui/icons-material/EventBusy";
import IndicatorTitle from "../../../components/shared/IndicatorTitle";

const TitleHianyzas = () => {
  return (
    <IndicatorTitle
      icon={EventBusyIcon}
      title="26. Hiányzás"
      description="Az igazolt és igazolatlan hiányzások száma és átlagos óraszáma"
    />
  );
};

export default TitleHianyzas;
