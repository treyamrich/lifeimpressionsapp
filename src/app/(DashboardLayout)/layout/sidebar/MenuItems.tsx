import {
  IconLayoutDashboard,
  IconUsersGroup,
  IconReceipt,
  IconBox,
  IconChecklist,
  IconCubePlus,
  IconClipboardPlus
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

const Menuitems = [
  {
    navlabel: true,
    subheader: "Home",
  },
  // {
  //   id: uniqueId(),
  //   title: "Dashboard",
  //   icon: IconLayoutDashboard,
  //   href: "/",
  // },
  {
    id: uniqueId(),
    title: "Inventory",
    icon: IconChecklist,
    href: "/",
  },
  {
    id: uniqueId(),
    title: "Report Generation",
    icon: IconReceipt,
    href: "/report-generation",
  },
  {
    navlabel: true,
    subheader: "Purchase Orders",
  },
  {
    id: uniqueId(),
    title: "Purchase Orders",
    icon: IconBox,
    href: "/purchase-orders",
  },
  {
    id: uniqueId(),
    title: "Add Purchase Order",
    icon: IconCubePlus,
    href: "/purchase-orders/create"
  },
  {
    navlabel: true,
    subheader: "Customer Orders",
  },
  {
    id: uniqueId(),
    title: "Customer Orders",
    icon: IconUsersGroup,
    href: "/customer-orders",
  },
  {
    id: uniqueId(),
    title: "Add Customer Order",
    icon: IconClipboardPlus,
    href: "/customer-orders/create"
  },
  // {
  //   navlabel: true,
  //   subheader: "Auth",
  // },
  // {
  //   id: uniqueId(),
  //   title: "Login",
  //   icon: IconLogin,
  //   href: "/authentication/login",
  // },
  // {
  //   id: uniqueId(),
  //   title: "Register",
  //   icon: IconUserPlus,
  //   href: "/authentication/register",
  // },
];

export default Menuitems;
