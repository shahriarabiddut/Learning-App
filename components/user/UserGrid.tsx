"use client";
import { Card } from "@/components/ui/card";
import { IUser } from "@/models/users.model";
import { UserActions } from "./UserActions";
import { useState } from "react";
import { Button } from "../ui/button";
import { FaBan } from "react-icons/fa6";
import { FaCheckCircle } from "react-icons/fa";
import { Checkbox } from "../ui/checkbox";

interface UserGridProps {
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

export const UserGrid = ({
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
}: UserGridProps) => {
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
        <div className="flex items-center gap-2 mb-4 bg-muted rounded-md px-4 py-3">
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
            className="bg-gray-900 text-white hover:bg-red-500 gap-1 dark:bg-red-900 dark:hover:bg-red-700"
          >
            <FaBan className="h-3 w-3" />
            Deactivate
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkStatusToggleClick(true)}
            className="bg-green-200 text-green-800 hover:bg-green-400 hover:text-white gap-1 dark:bg-green-900 dark:text-green-100 dark:hover:bg-green-700"
          >
            <FaCheckCircle className="h-4 w-4" />
            Activate
          </Button>
        </div>
      )}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user, index) => (
          <Card
            key={user.id}
            className={`px-4 py-6 flex flex-col relative bg-card text-card-foreground ${
              user.id === userId ? "pointer-events-none opacity-50" : ""
            }`}
          >
            {/* Checkbox */}
            <div className="absolute top-[2%] right-[0%]">
              <Checkbox
                checked={selectedUsers.includes(user?.id)}
                disabled={user.id === userId}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(checked, index, user?.id)
                }
                className="mr-2"
              />
            </div>

            {/* Card Content */}
            <div
              className="flex items-start space-x-4 cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-md p-1 -m-1"
              onClick={() => {
                if (user.id !== userId) handleViewClick(user);
              }}
            >
              {/* Image Container */}
              <div className="flex-shrink-0 w-16 h-16 rounded-xl border-2 border-border bg-muted flex items-center justify-center">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-full h-full rounded-lg object-cover"
                  />
                ) : (
                  <span className="text-2xl text-muted-foreground">
                    {user.name.charAt(0)}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1 space-y-2">
                <h2 className="text-lg font-bold text-foreground truncate">
                  {user.name}
                </h2>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Actions */}
            <UserActions
              user={user}
              onEdit={() => handleEditClick(user)}
              onView={() => handleViewClick(user)}
              onDelete={() => handleDeleteClick(user.id)}
              showtoggleButtons={true}
              onToggleStatus={() =>
                handleToggleStatusClick(user.id, user.isActive)
              }
              disabled={user.id === userId}
            />
          </Card>
        ))}
      </div>
    </>
  );
};
