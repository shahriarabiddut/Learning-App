"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IUser } from "@/models/users.model";
import { useState } from "react";
import { FaBan, FaCheckCircle } from "react-icons/fa";
import { Checkbox } from "../ui/checkbox";
import { UserActions } from "./UserActions";

interface UserTableProps {
  users: IUser[];
  userId: string | null;
  handleViewClick: (user: IUser) => void;
  handleEditClick: (user: IUser) => void;
  handleDeleteClick: (id: string) => void;
  handleToggleStatusClick: (id: string, currentStatus: boolean) => void;
  handleBulkDelete: (ids: string[]) => void;
  handleBulkStatusToggle: (ids: string[], targetStatus: boolean) => void;
  canManageUsers: boolean;
  isLoading: boolean;
}

export const UserTable = ({
  users,
  userId,
  handleViewClick,
  handleEditClick,
  handleDeleteClick,
  handleToggleStatusClick,
  handleBulkDelete,
  handleBulkStatusToggle,
  canManageUsers,
  isLoading,
}: UserTableProps) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [lastCheckedIndex, setLastCheckedIndex] = useState<number | null>(null);

  // Toggle selection for a single user
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Toggle select all on current page
  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user?.id));
    }
  };

  const handleCheckboxChange = (
    checked: boolean | string,
    index: number,
    userId: string | undefined
  ) => {
    if (checked === "indeterminate" || !userId) return;

    if (
      typeof window !== "undefined" &&
      window.event instanceof MouseEvent &&
      window.event.shiftKey &&
      lastCheckedIndex !== null
    ) {
      const start = Math.min(index, lastCheckedIndex);
      const end = Math.max(index, lastCheckedIndex);

      const range = users
        .slice(start, end + 1)
        .map((user) => user.id)
        .filter((id): id is string => !!id); // Filter out undefined ids

      setSelectedUsers((prev) => {
        // Determine if we should add or remove based on the last clicked checkbox
        const shouldAdd = !prev.includes(users[lastCheckedIndex].id);

        if (shouldAdd) {
          // Add all in range that aren't already selected
          const newSelections = new Set(prev);
          range.forEach((id) => newSelections.add(id));
          return Array.from(newSelections);
        } else {
          // Remove all in range that are selected
          return prev.filter((id) => !range.includes(id));
        }
      });
    } else {
      toggleUserSelection(userId);
      setLastCheckedIndex(index);
    }
  };

  // Handle bulk delete
  const handleBulkDeleteClick = () => {
    if (selectedUsers.length === 0) return;
    handleBulkDelete(selectedUsers);
    setSelectedUsers([]);
  };

  // Handle bulk status toggle
  const handleBulkStatusToggleClick = (targetStatus: boolean) => {
    // Handle bulk status toggle
    handleBulkStatusToggle(selectedUsers, targetStatus);
  };

  return (
    <>
      {selectedUsers.length > 0 && (
        <div className="flex items-center gap-2 mb-4 bg-gray-100 rounded-md px-4 py-3">
          <span className="text-sm font-medium">
            {selectedUsers.length} selected
          </span>

          <Button variant="outline" size="sm" onClick={toggleSelectAll}>
            {selectedUsers.length === users.length
              ? "Deselect all"
              : "Select all"}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDeleteClick}
          >
            Delete selected
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleBulkStatusToggleClick(false)}
            className="bg-gray-900 text-white hover:bg-red-500 gap-1"
          >
            <FaBan className="h-3 w-3" />
            Deactivate
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkStatusToggleClick(true)}
            className="bg-green-200 text-green-800 hover:bg-green-400 hover:text-white gap-1"
          >
            <FaCheckCircle className="h-4 w-4" />
            Activate
          </Button>
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="flex items-center gap-2">
                <Checkbox
                  checked={
                    users.length > 0 && selectedUsers.length === users.length
                  }
                  onCheckedChange={toggleSelectAll}
                  className="mr-2"
                />
                Name
              </TableHead>
              <TableHead>Store</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => {
              const isDisabled = user.id === userId;

              return (
                <TableRow
                  key={user.id}
                  className={isDisabled ? "pointer-events-none opacity-50" : ""}
                >
                  <TableCell className="font-medium truncate max-w-[200px] flex items-center gap-1">
                    <Checkbox
                      checked={selectedUsers.includes(user?.id)}
                      disabled={isDisabled}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(checked, index, user?.id)
                      }
                      className="mr-2"
                    />
                    <div
                      onClick={() => {
                        if (!isDisabled) handleViewClick(user);
                      }}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-xl border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name}
                            className="w-full h-full rounded-lg object-cover"
                          />
                        ) : (
                          <span className="text-2xl text-gray-500">
                            {user.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      {user.name}
                    </div>
                  </TableCell>

                  <TableCell>
                    {user.store != "0" ? (
                      <span className="font-medium">{user?.store}</span>
                    ) : (
                      "None"
                    )}
                  </TableCell>

                  <TableCell className="max-w-32">
                    <UserActions
                      user={user}
                      onEdit={() => handleEditClick(user)}
                      onView={() => handleViewClick(user)}
                      onDelete={() => handleDeleteClick(user.id)}
                      showtoggleButtons={false}
                      onToggleStatus={() =>
                        handleToggleStatusClick(user.id, user.isActive)
                      }
                      disabled={isDisabled}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
