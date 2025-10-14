// src/lib/hooks.ts
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "@/lib/redux/store";

// Use this instead of plain `useDispatch`
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Use this instead of plain `useSelector`
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
