"use client";
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
import { Checkbox } from "@/components/ui/checkbox";
import { UserActions } from "@/components/user/UserActions";

interface UserTableProps {
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

export const UserTable = ({
  users,
  userId,
  handleViewClick,
  handleEditClick,
  handleDeleteClick,
  handleToggleStatusClick,
  handleBulkDelete,
  handleBulkStatusToggle,
  canManage,
  isLoading,
  canDelete = false,
  canUpdate = false,
}: UserTableProps) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [lastCheckedIndex, setLastCheckedIndex] = useState<number | null>(null);

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

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
        .filter((id): id is string => !!id);

      setSelectedUsers((prev) => {
        const shouldAdd = !prev.includes(users[lastCheckedIndex].id);

        if (shouldAdd) {
          const newSelections = new Set(prev);
          range.forEach((id) => newSelections.add(id));
          return Array.from(newSelections);
        } else {
          return prev.filter((id) => !range.includes(id));
        }
      });
    } else {
      toggleUserSelection(userId);
      setLastCheckedIndex(index);
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedUsers.length === 0) return;
    handleBulkDelete(selectedUsers);
    setSelectedUsers([]);
  };

  const handleBulkStatusToggleClick = (targetStatus: boolean) => {
    handleBulkStatusToggle(selectedUsers, targetStatus);
  };

  return (
    <div className="w-full">
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

      <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="font-semibold text-gray-700">
                  <div className="flex items-center gap-2">
                    {canManage && (
                      <Checkbox
                        checked={
                          users.length > 0 &&
                          selectedUsers.length === users.length
                        }
                        onCheckedChange={toggleSelectAll}
                        className="border-gray-400"
                      />
                    )}
                    <span>User</span>
                  </div>
                </TableHead>
                {canManage && (
                  <>
                    <TableHead className="text-center font-semibold text-gray-700 hidden md:table-cell">
                      Role
                    </TableHead>
                    <TableHead className="text-center font-semibold text-gray-700 hidden sm:table-cell">
                      Status
                    </TableHead>
                    {canManage && (
                      <TableHead className="text-center font-semibold text-gray-700">
                        Actions
                      </TableHead>
                    )}
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => {
                const isDisabled = user.id === userId;

                return (
                  <TableRow
                    key={user.id}
                    className={`
                      ${
                        isDisabled
                          ? "pointer-events-none opacity-50"
                          : "hover:bg-gray-50"
                      }
                      transition-colors duration-150
                    `}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {canManage && (
                          <Checkbox
                            checked={selectedUsers.includes(user?.id)}
                            disabled={isDisabled}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(checked, index, user?.id)
                            }
                            className="border-gray-400 flex-shrink-0"
                          />
                        )}
                        <div
                          onClick={() => {
                            if (!isDisabled) handleViewClick(user);
                          }}
                          className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                        >
                          <div className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-gray-200 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden">
                            {user.image ? (
                              <img
                                src={user.image}
                                alt={user.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-lg font-semibold text-indigo-600">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 truncate">
                              {user?.name}
                            </div>
                            {canManage && (
                              <div className="flex items-center gap-2 mt-0.5 md:hidden">
                                <span className="text-xs text-gray-500 capitalize">
                                  {user?.role}
                                </span>
                                <span className="text-gray-300">•</span>
                                <span
                                  className={`text-xs font-medium ${
                                    user.isActive
                                      ? "text-emerald-600"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {user.isActive ? "Active" : "Inactive"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {canManage && (
                      <>
                        <TableCell className="text-center hidden md:table-cell">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                            {user?.role}
                          </span>
                        </TableCell>
                        <TableCell className="text-center hidden sm:table-cell">
                          <span
                            className={`
                            inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                            ${
                              user.isActive
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-gray-100 text-gray-600"
                            }
                          `}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        {canManage && (
                          <TableCell className="text-center">
                            <UserActions
                              user={user}
                              onEdit={() => handleEditClick(user)}
                              onView={() => handleViewClick(user)}
                              onDelete={() => handleDeleteClick(user.id)}
                              showtoggleButtons={false}
                              onToggleStatus={() =>
                                handleToggleStatusClick(user.id, user.isActive)
                              }
                              isLoading={isDisabled || isLoading}
                              canDelete={canDelete}
                              canUpdate={canUpdate}
                            />
                          </TableCell>
                        )}
                      </>
                    )}
                  </TableRow>
                );
              })}
              {users.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={canManage ? 4 : 1}
                    className="text-center py-12 text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <svg
                        className="w-12 h-12 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <p className="font-medium">No users found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
