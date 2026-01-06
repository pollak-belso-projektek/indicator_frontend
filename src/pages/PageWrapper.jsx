import { Box, Paper, Typography, Collapse, IconButton } from "@mui/material";
import { useState } from "react";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

/**
 * PageWrapper - A reusable wrapper component for pages
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The main content of the page
 * @param {React.ReactNode} props.infoContent - Optional info/help content displayed in the top section
 * @param {React.ReactNode} props.titleContent - Optional page title content
 * @param {boolean} props.defaultInfoOpen - Whether the info section is open by default (default: true)
 * @param {boolean} props.showInfoSection - Whether to show the info section at all (default: true if infoContent provided)
 * @param {Object} props.sx - Additional styles for the wrapper
 */
const PageWrapper = ({
  children,
  infoContent,
  titleContent,
  defaultInfoOpen = false,
  showInfoSection = true,
  sx = {},
}) => {
  const [infoOpen, setInfoOpen] = useState(defaultInfoOpen);

  const hasInfoSection = showInfoSection && infoContent;
  const hasTitleSection = !!titleContent;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 3,
        ...sx,
      }}
    >
      {hasTitleSection && <Box>{titleContent}</Box>}

      {/* Info Section - Collapsible */}
      {hasInfoSection && (
        <Paper
          elevation={1}
          sx={{
            overflow: "hidden",
            border: "1px solid",
            borderColor: "white",
            backgroundColor: "warning.100",
          }}
        >
          {/* Info Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
              py: 1,
              cursor: "pointer",
            }}
            className="bg-[#f7e970]"
            onClick={() => setInfoOpen(!infoOpen)}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <InfoIcon fontSize="small" />
              <Typography variant="subtitle2" fontWeight="medium">
                Adatgyűjtési információk
              </Typography>
            </Box>
            <IconButton
              size="small"
              sx={{ color: "inherit" }}
              onClick={(e) => {
                e.stopPropagation();
                setInfoOpen(!infoOpen);
              }}
            >
              {infoOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>

          {/* Info Content */}
          <Collapse in={infoOpen}>
            <Box className="bg-yellow-100" sx={{ p: 2 }}>
              {infoContent}
            </Box>
          </Collapse>
        </Paper>
      )}

      {/* Main Content Section */}
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Box>
  );
};

/**
 * PageInfo - A component for structuring info content within PageWrapper
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The info content
 * @param {string} props.description - A text description
 * @param {Array} props.items - List of info items to display as bullet points
 */
export const PageInfo = ({ children, description, items = [] }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
      {items.length > 0 && (
        <Box component="ul" sx={{ m: 0, pl: 2 }}>
          {items.map((item, index) => (
            <Typography
              key={index}
              component="li"
              variant="body2"
              color="text.secondary"
            >
              {item}
            </Typography>
          ))}
        </Box>
      )}
      {children}
    </Box>
  );
};

/**
 * PageSection - A component for creating sections within the main content
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The section content
 * @param {string} props.title - Section title
 * @param {Object} props.sx - Additional styles
 */
export const PageSection = ({ children, title, sx = {} }) => {
  return (
    <Paper elevation={2} sx={{ p: 3, ...sx }}>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      {children}
    </Paper>
  );
};

export default PageWrapper;
