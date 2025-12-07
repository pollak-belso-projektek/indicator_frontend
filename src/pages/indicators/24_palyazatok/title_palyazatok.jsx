import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import IndicatorTitle from "../../../components/shared/IndicatorTitle";

const TitlePalyazatok = () => {
  return (
    <IndicatorTitle
      icon={RequestQuoteIcon}
      title="24. Pályázatok"
      description="A benyújtott és elnyert pályázatok száma, összegei és tématerületei"
    />
  );
};

export default TitlePalyazatok;
