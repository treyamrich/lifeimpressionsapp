import * as React from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { IconButton } from "@mui/material";

export type IconMenuAction = {
  onClick: () => void;
  text: string;
};

export default function IconMenu({
  icon,
  menuActions,
}: {
  icon: React.ReactNode;
  menuActions: IconMenuAction[];
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  return (
    <div>
      <IconButton
        id="icon-menu-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleOpen}
      >
        {icon}
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {menuActions.map((menuItem, idx) => (
          <MenuItem
            key={`icon-menu-item-${idx}`}
            onClick={() => {
              menuItem.onClick();
              handleClose();
            }}
          >
            {menuItem.text}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
