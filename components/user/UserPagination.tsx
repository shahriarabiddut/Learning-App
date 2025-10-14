"use client";

import { memo } from "react";
import SharedPagination from "@/components/shared/SharedPagination";
import {
  setItemsPerPage,
  setCurrentPage,
} from "@/lib/redux-features/user/userSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";

interface UserPaginationProps {
  totalPages: number;
}

const UserPagination = memo(({ totalPages }: UserPaginationProps) => {
  const dispatch = useAppDispatch();
  const { currentPage, itemsPerPage } = useAppSelector((state) => state.user);

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const handleItemsPerPageChange = (value: number) => {
    dispatch(setItemsPerPage(value));
    dispatch(setCurrentPage(1)); // Reset page to 1 on items per page change
  };

  return (
    <SharedPagination
      currentPage={currentPage}
      totalPages={totalPages}
      itemsPerPage={itemsPerPage}
      onPageChange={handlePageChange}
      onItemsPerPageChange={handleItemsPerPageChange}
    />
  );
});

UserPagination.displayName = "UserPagination";

export default UserPagination;
