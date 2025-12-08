import SchoolIcon from "@mui/icons-material/School";
import IndicatorTitle from "../../../components/shared/IndicatorTitle";

const TitleTanulmanyiEredmeny = () => {
  return (
    <IndicatorTitle
      icon={SchoolIcon}
      title="25. Tanulmányi eredmény"
      description="A tanulók tanulmányi átlagai és osztályzatai évfolyamonként és tantárgyanként"
    />
  );
};

export default TitleTanulmanyiEredmeny;
