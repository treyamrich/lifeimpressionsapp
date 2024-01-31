import {
  IconLayoutDashboard,
  IconUsersGroup,
  IconReceipt,
  IconBox,
  IconChecklist
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
    title: "Purchase Orders",
    icon: IconBox,
    href: "/purchase-orders",
  },
  {
    id: uniqueId(),
    title: "Customer Orders",
    icon: IconUsersGroup,
    href: "/customer-orders",
  },
  {
    id: uniqueId(),
    title: "Report Generation",
    icon: IconReceipt,
    href: "/report-generation",
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
