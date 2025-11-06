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
  canManage: boolean;
  isLoading: boolean;
  canDelete: boolean;
  canUpdate: boolean;
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
  canManage = false,
  isLoading = false,
  canDelete = false,
  canUpdate = false,
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
      {selectedUsers.length > 0 && canManage && (
        <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-4 py-3 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-blue-900">
              {selectedUsers.length}{" "}
              {selectedUsers.length === 1 ? "user" : "users"} selected
            </span>

            <div className="flex flex-wrap items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
                className="text-xs sm:text-sm"
              >
                {selectedUsers.length === users.length
                  ? "Deselect all"
                  : "Select all"}
              </Button>
              {canUpdate && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusToggleClick(true)}
                    className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 text-xs sm:text-sm"
                  >
                    <FaCheckCircle className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Activate</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkStatusToggleClick(false)}
                    className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200 text-xs sm:text-sm"
                  >
                    <FaBan className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">Deactivate</span>
                  </Button>
                </>
              )}
              {canDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDeleteClick}
                  className="text-xs sm:text-sm"
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
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
              {canManage && (
                <Checkbox
                  checked={selectedUsers.includes(user?.id)}
                  disabled={user.id === userId}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(checked, index, user?.id)
                  }
                  className="mr-2"
                />
              )}
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
            {canManage && (
              <UserActions
                user={user}
                onEdit={() => handleEditClick(user)}
                onView={() => handleViewClick(user)}
                onDelete={() => handleDeleteClick(user.id)}
                showtoggleButtons={true}
                onToggleStatus={() =>
                  handleToggleStatusClick(user.id, user.isActive)
                }
                isLoading={isLoading}
                canDelete={canDelete}
                canUpdate={canUpdate}
              />
            )}
          </Card>
        ))}
      </div>
    </>
  );
};
