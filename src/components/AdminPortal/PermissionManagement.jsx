import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from "../../styles/AdminPortal/Table.styled";
import {
  Switch,
  SwitchInput,
  SwitchSlider,
} from "../../styles/AdminPortal/Security.styled";
import {
  getSystemPermissionsAPI,
  updateSystemPermissionAPI,
} from "../../api/AdminPortal/PermissionManagementApi";
import ConfirmDialog from "./ConfirmDialog";
import SearchBar from "./SearchBar";
import Toast from "../../utility/AdminPortal/Toast";

const PermissionManagement = () => {
  const PAGE_SIZE = 10;
  const queryClient = useQueryClient();
  const hasShownUnauthorizedToastRef = useRef(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    permissionId: null,
    permissionName: "",
    nextIsDefault: false,
  });

  const {
    data: systemPermissionsData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["systemPermissions"],
    queryFn: getSystemPermissionsAPI,
  });

  const permissions = systemPermissionsData?.data || [];

  const filteredPermissions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return permissions;
    }

    return permissions.filter((permission) => {
      const name = (permission.name || "").toLowerCase();
      const category = (permission.category || "").toLowerCase();

      return (
        name.includes(normalizedSearch) || category.includes(normalizedSearch)
      );
    });
  }, [permissions, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPermissions.length / PAGE_SIZE),
  );

  const paginatedPermissions = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredPermissions.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredPermissions, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (
      isError &&
      error?.response?.status === 401 &&
      !hasShownUnauthorizedToastRef.current
    ) {
      Toast.error("View permission not allowed");
      hasShownUnauthorizedToastRef.current = true;
    }

    if (!isError) {
      hasShownUnauthorizedToastRef.current = false;
    }
  }, [isError, error]);

  const updatePermissionMutation = useMutation({
    mutationFn: updateSystemPermissionAPI,
    onSuccess: () => {
      Toast.success("Permission updated successfully");
      queryClient.invalidateQueries({ queryKey: ["systemPermissions"] });
      setConfirmDialog({
        isOpen: false,
        permissionId: null,
        permissionName: "",
        nextIsDefault: false,
      });
    },
    onError: (mutationError) => {
      Toast.error(
        mutationError?.response?.data?.message || "Failed to update permission",
      );
    },
  });

  const handleSwitchToggle = (permission) => {
    setConfirmDialog({
      isOpen: true,
      permissionId: permission.permissionId,
      permissionName: permission.name,
      nextIsDefault: !permission.isDefault,
    });
  };

  const handleConfirmUpdate = () => {
    if (!confirmDialog.permissionId) {
      return;
    }

    updatePermissionMutation.mutate({
      permissionId: confirmDialog.permissionId,
      data: {
        isDefault: confirmDialog.nextIsDefault,
      },
    });
  };

  const handleCancelUpdate = () => {
    if (updatePermissionMutation.isPending) {
      return;
    }

    setConfirmDialog({
      isOpen: false,
      permissionId: null,
      permissionName: "",
      nextIsDefault: false,
    });
  };

  return (
    <>
      <SearchBar
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by name or category"
        ariaLabel="Search permissions"
      />

      <TableContainer style={{ marginTop: "24px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Description</TableHeader>
              <TableHeader>Category</TableHeader>
              <TableHeader style={{ textAlign: "center" }}>
                Is Default
              </TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#9ca3af",
                  }}
                >
                  Loading permissions...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#dc2626",
                  }}
                >
                  {error?.response?.status === 401
                    ? "No data available"
                    : `Error loading permissions: ${error?.message || "Unknown error"}`}
                </TableCell>
              </TableRow>
            ) : paginatedPermissions.length > 0 ? (
              paginatedPermissions.map((permission) => (
                <TableRow key={permission.permissionId}>
                  <TableCell>{permission.name}</TableCell>
                  <TableCell>{permission.description}</TableCell>
                  <TableCell style={{ textTransform: "capitalize" }}>
                    {permission.category}
                  </TableCell>
                  <TableCell style={{ textAlign: "center" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Switch>
                        <SwitchInput
                          type="checkbox"
                          checked={permission.isDefault}
                          onChange={() => handleSwitchToggle(permission)}
                          disabled={updatePermissionMutation.isPending}
                        />
                        <SwitchSlider />
                      </Switch>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#9ca3af",
                  }}
                >
                  No permissions available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {!isLoading && !isError && filteredPermissions.length > 0 ? (
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
            {Math.min(currentPage * PAGE_SIZE, filteredPermissions.length)} of{" "}
            {filteredPermissions.length}
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
        isOpen={confirmDialog.isOpen}
        onClose={handleCancelUpdate}
        onConfirm={handleConfirmUpdate}
        title={
          confirmDialog.nextIsDefault
            ? "Enable Default Permission"
            : "Disable Default Permission"
        }
        message={`Are you sure you want to ${confirmDialog.nextIsDefault ? "enable" : "disable"} default for "${confirmDialog.permissionName}"?`}
        confirmText={confirmDialog.nextIsDefault ? "Enable" : "Disable"}
        cancelText="Cancel"
        variant={confirmDialog.nextIsDefault ? "primary" : "danger"}
        isLoading={updatePermissionMutation.isPending}
      />
    </>
  );
};

export default PermissionManagement;
