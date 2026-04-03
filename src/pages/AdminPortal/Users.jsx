import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardContent } from "../../styles/AdminPortal/Dashboard.styled";
import { MdOutlineModeEditOutline } from "react-icons/md";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  TableHeader2,
} from "../../styles/AdminPortal/Table.styled";
import ConfirmDialog from "../../components/AdminPortal/ConfirmDialog";
import UserManagement from "../../components/AdminPortal/UserManagement";
import SearchBar from "../../components/AdminPortal/SearchBar";
import {
  deletePlatformAdminAPI,
  getPlatformUsersAPI,
} from "../../api/AdminPortal/UserManagementApi";
import Toast from "../../utility/AdminPortal/Toast";
import { AiOutlineDelete, AiOutlinePlus } from "react-icons/ai";
import { AddButton } from "../../styles/AdminPortal/Form.styled";
import { FaRegEye } from "react-icons/fa";
import { ROUTE } from "../../common/AdminPortal/Routes";
import { useAuth } from "../../hooks/AdminPortal/useAuth";
import { ROLES } from "../../common/AdminPortal/Roles";

const Users = () => {
  const PAGE_SIZE = 10;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const canViewAdminTable = hasPermission(ROLES.PLATFORM_USERS_VIEW);
  const canAddAdmin = hasPermission(ROLES.PLATFORM_USERS_CREATE);
  const canDeleteAdmin = hasPermission(ROLES.PLATFORM_USERS_DELETE);
  const canUpdateAdmin = hasPermission(ROLES.PLATFORM_USERS_EDIT);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // State for delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    userId: null,
    userName: "",
  });

  // Mutation for deleting admin
  const deleteAdminMutation = useMutation({
    mutationFn: deletePlatformAdminAPI,
    onSuccess: () => {
      Toast.success("Admin deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["platformUsers"] });
      setDeleteDialog({ isOpen: false, userId: null, userName: "" });
    },
    onError: (error) => {
      Toast.error(error?.response?.data?.message || "Failed to delete admin");
    },
  });

  // Fetch platform users from API
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["platformUsers"],
    queryFn: getPlatformUsersAPI,
    enabled: canViewAdminTable, // Only fetch if user has permission
  });

  // Transform API data to table format with permission fields
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (data?.data) {
      const transformedUsers = data.data.map((user) => ({
        id: user.adminId,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        description: user.role
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        email: user.email,
        isActive: user.isActive,
        permissions: user.permissions || [],
      }));
      setUsers(transformedUsers);
    }
  }, [data]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return users;
    }

    return users.filter((user) =>
      (user.name || "").toLowerCase().includes(normalizedSearch),
    );
  }, [users, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleDeleteClick = (userId, userName) => {
    setDeleteDialog({
      isOpen: true,
      userId,
      userName,
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.userId) {
      deleteAdminMutation.mutate(deleteDialog.userId);
    }
  };

  const handleDeleteCancel = () => {
    if (!deleteAdminMutation.isPending) {
      setDeleteDialog({ isOpen: false, userId: null, userName: "" });
    }
  };

  const handleViewUser = (user) => {
    // console.log("Viewing user with data:", {
    //   id: user.id,
    //   firstName: user.firstName,
    //   lastName: user.lastName,
    //   email: user.email,
    //   role: user.role,
    //   isActive: user.isActive,
    // });
    navigate(`${ROUTE.USER_DETAIL}?adminId=${user.id}`, {
      state: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        permissions: user.permissions,
      },
    });
  };

  if (isLoading) {
    return (
      <DashboardContent>
        <div>Loading users...</div>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <TableHeader2>
        <h1>Platform Admins</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span className="count">
            Total: {filteredUsers.length || 0} User
            {filteredUsers.length !== 1 ? "s" : ""}
          </span>
          {canAddAdmin && !showForm && (
            <AddButton onClick={() => setShowForm(true)}>
              <AiOutlinePlus />
              Add Admin
            </AddButton>
          )}
        </div>
      </TableHeader2>

      <UserManagement
        showForm={showForm}
        title="Add New Admin"
        onCancel={() => setShowForm(false)}
        onSuccess={() => setShowForm(false)}
      />
      {canViewAdminTable && (
        <>
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name"
            ariaLabel="Search users by name"
          />

          <TableContainer style={{ marginTop: "24px" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Description</TableHeader>

                  {/* <TableHeader>Activate</TableHeader> */}
                  <TableHeader>Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#9ca3af",
                      }}
                    >
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#dc2626",
                      }}
                    >
                      Error loading users: {error?.message || "Unknown error"}
                    </TableCell>
                  </TableRow>
                ) : paginatedUsers.length > 0 ? (
                  paginatedUsers
                    // .filter((user) => user.description !== "Super Admin")
                    .map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.description}</TableCell>
                        <TableCell>
                          {canViewAdminTable && (
                            <FaRegEye
                              onClick={() => handleViewUser(user)}
                              style={{
                                fontSize: "18px",
                                color: "#ed8b00",
                                cursor: "pointer",
                                transition: "color 0.2s ease",
                                marginRight: "15px",
                              }}
                              onMouseEnter={(e) =>
                                (e.target.style.color = "#ed8b00")
                              }
                              onMouseLeave={(e) =>
                                (e.target.style.color = "#ed8b00")
                              }
                              title="View user"
                            />
                          )}

                          {canUpdateAdmin && (
                            <MdOutlineModeEditOutline
                              onClick={() => handleViewUser(user)}
                              style={{
                                fontSize: "20px",
                                color: "#ed8b00",
                                cursor: "pointer",
                                transition: "color 0.2s ease",
                                marginRight: "15px",
                              }}
                              onMouseEnter={(e) =>
                                (e.target.style.color = "#ed8b00")
                              }
                              onMouseLeave={(e) =>
                                (e.target.style.color = "#ed8b00")
                              }
                              title="Edit user"
                            />
                          )}

                          {canDeleteAdmin && (
                            <AiOutlineDelete
                              onClick={() =>
                                handleDeleteClick(user.id, user.name)
                              }
                              style={{
                                fontSize: "20px",
                                color: "#dc2626",
                                cursor: "pointer",
                                transition: "color 0.2s ease",
                                marginRight: "15px",
                              }}
                              onMouseEnter={(e) =>
                                (e.target.style.color = "#b91c1c")
                              }
                              onMouseLeave={(e) =>
                                (e.target.style.color = "#dc2626")
                              }
                              title="Delete user"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#9ca3af",
                      }}
                    >
                      No users available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {!isLoading && !isError && filteredUsers.length > 0 ? (
        <div
          style={{
            marginTop: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span style={{ color: "#6b7280", fontSize: "14px" }}>
            Showing {(currentPage - 1) * PAGE_SIZE + 1} to{" "}
            {Math.min(currentPage * PAGE_SIZE, filteredUsers.length)} of{" "}
            {filteredUsers.length}
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                background: "#ffffff",
                color: "#374151",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
              }}
            >
              Previous
            </button>
            <span style={{ color: "#374151", fontSize: "14px" }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                background: "#ffffff",
                color: "#374151",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              }}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Admin User"
        message={`Are you sure you want to delete "${deleteDialog.userName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteAdminMutation.isPending}
      />
    </DashboardContent>
  );
};

export default Users;
