import { create } from "zustand";

interface AdminState {
  searchQuery: string;
  statusFilter: string;
  dateFilter: string;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setDateFilter: (date: string) => void;
  resetFilters: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  searchQuery: "",
  statusFilter: "all",
  dateFilter: "all",
  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setDateFilter: (date) => set({ dateFilter: date }),
  resetFilters: () => set({ searchQuery: "", statusFilter: "all", dateFilter: "all" }),
}));
