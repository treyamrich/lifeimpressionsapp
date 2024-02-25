import {
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import MoreInfoAccordian from "../MoreInfoAccordian/MoreInfoAccordian";

const underlineBoldStyle = { fontWeight: "bold", textDecoration: "underline" };

const TableInfoHeader = ({ subheaderText }: { subheaderText: string }) => {
  return (
    <MoreInfoAccordian>
      <List style={{ paddingTop: 0 }}>
        <ListItem style={{ paddingTop: 0, paddingBottom: 0 }} key="item-0">
          <ListItemText primary="By default, the first 100 records will be loaded into the table." />
        </ListItem>
        <ListItem style={{ paddingTop: 0, paddingBottom: 0 }} key="item-1">
          <ListItemText primary="Press the load more button to load records into the table." />
        </ListItem>
        <ListItem style={{ paddingTop: 0, paddingBottom: 0 }}>
          <ListItemText
            key="item-2"
            primary={[
              "Records that are not loaded ",
              <span style={underlineBoldStyle} key="item-2-span">
                will not appear
              </span>,
              " in your search filters.",
            ]}
          />
        </ListItem>
        <ListItem style={{ paddingTop: 0, paddingBottom: 0 }} key="item-3">
          <ListItemText
            primary={<span style={underlineBoldStyle}>{subheaderText}</span>}
          />
        </ListItem>
      </List>
    </MoreInfoAccordian>
  );
};

export default TableInfoHeader;
