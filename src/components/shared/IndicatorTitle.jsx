import { Card, CardContent, Stack, Typography } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";

/**
 * IndicatorTitle - A reusable title component for indicator pages
 *
 * @param {Object} props
 * @param {React.ElementType} props.icon - MUI icon component to display (default: SchoolIcon)
 * @param {string} props.title - The title text (e.g., "1. Tanulólétszám")
 * @param {string} props.description - Description text shown below the title
 * @param {string} props.gradient - Custom gradient background (default: purple gradient)
 * @param {string} props.iconColor - Color for the icon (default: "#ffeb3b")
 * @param {Object} props.sx - Additional styles for the Card component
 */
const IndicatorTitle = ({
  icon: Icon = SchoolIcon,
  title,
  description,
  gradient = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  iconColor = "#ffeb3b",
  sx = {},
}) => {
  return (
    <Card
      elevation={6}
      sx={{
        mb: 2,
        background: gradient,
        color: "white",
        borderRadius: 3,
        boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
        ...sx,
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Icon sx={{ fontSize: 40, color: iconColor }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Stack>

        {description && (
          <Typography variant="body1" sx={{ opacity: 0.8 }}>
            {description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default IndicatorTitle;
