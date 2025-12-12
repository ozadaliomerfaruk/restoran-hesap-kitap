// Cari Feature Types

import { CariType } from "../../types";

export type CariIslemTipi =
  | "alis"
  | "iade"
  | "odeme"
  | "tahsilat"
  | "satis"
  | "musteri_iade";

export interface IslemTipiConfig {
  key: CariIslemTipi;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

export type CariFilter = "all" | CariType;
