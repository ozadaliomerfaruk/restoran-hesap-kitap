// Kasa Feature Types

import { LucideIcon } from "lucide-react-native";

export interface KasaGroupConfig {
  type: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export interface KasaGroupData {
  kasalar: any[];
  total: number;
}
