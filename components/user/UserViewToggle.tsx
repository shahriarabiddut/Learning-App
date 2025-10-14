"use client";
import { useIsMobile } from "@/components/ui/use-mobile";
import { setSortBy, setViewMode } from "@/lib/redux-features/user/userSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  AddNewButton,
  SortSelector,
  ViewModeToggle,
} from "@/components/shared/InsideToggles";

export const UserViewToggle = ({
  setIsFormOpen,
  canManageUsers,
}: {
  setIsFormOpen: (data: boolean) => void;
  canManageUsers: boolean;
}) => {
  const dispatch = useAppDispatch();
  const { viewMode, sortBy } = useAppSelector((state) => state.user);

  return (
    <>
      <div className="flex items-center gap-2">
        <SortSelector
          value={sortBy}
          onChange={(val) => dispatch(setSortBy(val))}
        />
        <ViewModeToggle
          value={viewMode}
          onChange={(val) => dispatch(setViewMode(val))}
        />
        {canManageUsers && <AddNewButton onClick={() => setIsFormOpen(true)} />}
      </div>
    </>
  );
};
