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
  onAddNew,
  canAdd,
}: {
  onAddNew: () => void;
  canAdd: boolean;
}) => {
  const dispatch = useAppDispatch();
  const { viewMode, sortBy } = useAppSelector((state) => state.user);

  return (
    <>
      <div className="flex items-center gap-1.5 flex-wrap">
        <SortSelector
          value={sortBy}
          onChange={(val) => dispatch(setSortBy(val))}
          width="w-[180px]"
        />
        <ViewModeToggle
          value={viewMode}
          onChange={(val) => dispatch(setViewMode(val))}
        />
        {canAdd && <AddNewButton onClick={onAddNew} />}
      </div>
    </>
  );
};
