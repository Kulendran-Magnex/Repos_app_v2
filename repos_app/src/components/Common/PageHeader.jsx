import { Box, Typography, IconButton, Button, Tooltip } from "@mui/material";

export default function PageHeader({
  title,
  onAdd,
  addIcon,
  addTooltip = "Add",
  actions = [],
  children,
}) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap={2}
      padding={1}
      sx={{ backgroundColor: "whitesmoke" }}
    >
      <Box display="flex" alignItems="center" gap={1}>
        <Typography variant="h5">{title}</Typography>
        {onAdd && (
          <Tooltip title={addTooltip}>
            <span>
              <IconButton color="primary" onClick={onAdd}>
                {addIcon}
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Box>
      <Box display="flex" alignItems="center" gap={1}>
        {actions.map((action, idx) => (
          <span key={idx}>{action}</span>
        ))}
        {children}
      </Box>
    </Box>
  );
}
