// Çek/Senet Feature Types

export type FilterType = "all" | "cek" | "senet";
export type DirectionFilter = "all" | "alacak" | "borc";

export interface CekSenetFilterState {
  type: FilterType;
  direction: DirectionFilter;
}
