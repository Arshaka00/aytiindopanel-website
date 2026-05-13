import {
  IconCompanyLocation,
  IconManufacturing,
  IconProcessInstall,
  IconSandwichPanelPU,
  IconThermostat,
} from "@/components/aytipanel/icons";

export const PROSES_KERJA_STEPS = [
  {
    slug: "konsultasi",
    title: "Sandwich\nPanel PU",
    Icon: IconSandwichPanelPU,
  },
  {
    slug: "survey",
    title: "Sandwich\nPanel EPS",
    Icon: IconCompanyLocation,
  },
  {
    slug: "produksi",
    title: "Cold\nStorage",
    Icon: IconManufacturing,
  },
  {
    slug: "instalasi",
    title: "Sistem\nPendingin",
    Icon: IconProcessInstall,
  },
  {
    slug: "selesai",
    title: "Door &\nDock System",
    Icon: IconThermostat,
  },
] as const;

export type ProsesKerjaStep = (typeof PROSES_KERJA_STEPS)[number];
export type ProsesKerjaSlug = ProsesKerjaStep["slug"];
