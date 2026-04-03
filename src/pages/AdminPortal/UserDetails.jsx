import React, { useEffect, useState } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IoArrowBack } from "react-icons/io5";
import { DashboardContent } from "../../styles/AdminPortal/Dashboard.styled";
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
  FormContainer,
  FormHeader,
  FormGrid,
} from "../../styles/AdminPortal/Form.styled";
import {
  PrimaryButton,
  SecondaryButton,
} from "../../components/AdminPortal/Button";
import Input from "../../components/AdminPortal/Input";
import MultiSelectDropdown from "../../components/AdminPortal/MultiSelectDropdown";
import {
  SwitchContainer,
  Switch,
  SwitchInput,
  SwitchSlider,
} from "../../styles/AdminPortal/Security.styled";
import {
  getPermissionsAPI,
  getPlatformUsersAPI,
  updateUserFeaturesAPI,
} from "../../api/AdminPortal/UserManagementApi";
import Toast from "../../utility/AdminPortal/Toast";
import ConfirmDialog from "../../components/AdminPortal/ConfirmDialog";
import { useAuth } from "../../hooks/AdminPortal/useAuth";
import { ROLES } from "../../common/AdminPortal/Roles";

// Permission dependency rules - define which permissions require other permissions
// Format: { dependent: "permission.key", requires: ["permission.key1", "permission.key2"] }
const PERMISSION_DEPENDENCY_RULES = [
  { dependent: ROLES.BILLING_MANAGE, requires: [ROLES.BILLING_VIEW] },
  {
    dependent: ROLES.PLATFORM_USERS_EDIT,
    requires: [ROLES.PLATFORM_USERS_VIEW],
  },
  {
    dependent: ROLES.PLATFORM_USERS_CREATE,
    requires: [ROLES.PLATFORM_USERS_VIEW],
  },
  {
    dependent: ROLES.PLATFORM_USERS_DELETE,
    requires: [ROLES.PLATFORM_USERS_VIEW],
  },
  { dependent: ROLES.RESELLERS_CREATE, requires: [ROLES.RESELLERS_VIEW] },
  { dependent: ROLES.RESELLERS_UPDATE, requires: [ROLES.RESELLERS_VIEW] },
  { dependent: ROLES.RESELLERS_DEACTIVATE, requires: [ROLES.RESELLERS_VIEW] },
  { dependent: ROLES.RESELLERS_DELETE, requires: [ROLES.RESELLERS_VIEW] },
  { dependent: ROLES.ROLEPERMISSIONS_EDIT, requires: [ROLES.PLATFORM_CONFIG] },
];

const UserDetails = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const canUpdateAdmin = hasPermission(ROLES.PLATFORM_USERS_EDIT);
  const canViewAdminTable = hasPermission(ROLES.PLATFORM_USERS_VIEW);
  const adminId = searchParams.get("adminId");

  const [permissions, setPermissions] = useState([]);
  const [originalPermissions, setOriginalPermissions] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [dependencyDialog, setDependencyDialog] = useState({
    isOpen: false,
    newPermissionId: null,
    dependentPermissions: [],
  });

  const [userFormData, setUserFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
  });

  const { data: platformUsersData } = useQuery({
    queryKey: ["platformUsers"],
    queryFn: getPlatformUsersAPI,
    enabled: !!adminId,
  });

  const {
    data: permissionsData,
    isLoading: isLoadingPermissions,
    isError: isPermissionsError,
    error: permissionsError,
  } = useQuery({
    queryKey: ["getPermissions"],
    queryFn: getPermissionsAPI,
    enabled: canViewAdminTable,
  });

  const availablePermissions = permissionsData?.data || [];
  const selectedAdmin = platformUsersData?.data?.find(
    (user) => user.adminId === adminId,
  );

  useEffect(() => {
    setIsInitialized(false);
  }, [adminId]);

  useEffect(() => {
    if (isInitialized) {
      return;
    }

    const stateUser = location.state || {};
    const sourceUser = selectedAdmin || {};

    if (!stateUser.firstName && !sourceUser.firstName) {
      return;
    }

    setUserFormData({
      firstName: stateUser.firstName || sourceUser.firstName || "",
      lastName: stateUser.lastName || sourceUser.lastName || "",
      email: stateUser.email || sourceUser.email || "",
      role: stateUser.role || sourceUser.role || "",
    });

    const statePermissions = Array.isArray(stateUser.permissions)
      ? stateUser.permissions
      : [];
    const sourcePermissions = Array.isArray(sourceUser.permissions)
      ? sourceUser.permissions
      : [];

    const mappedPermissions = (
      statePermissions.length > 0 ? statePermissions : sourcePermissions
    ).map((permission) => ({
      permissionId: permission.permissionId,
      key: permission.key,
      name: permission.name,
      isGranted: !!permission.isGranted,
    }));

    setPermissions(mappedPermissions);
    setOriginalPermissions(JSON.parse(JSON.stringify(mappedPermissions)));
    setHasChanges(false);
    setIsInitialized(true);
  }, [isInitialized, location.state, selectedAdmin]);

  const updatePermissionsMutation = useMutation({
    mutationFn: updateUserFeaturesAPI,
    onSuccess: () => {
      Toast.success("User permissions updated successfully");
      queryClient.invalidateQueries({ queryKey: ["platformUsers"] });
      setOriginalPermissions(JSON.parse(JSON.stringify(permissions)));
      setHasChanges(false);
    },
    onError: (error) => {
      Toast.error(
        error?.response?.data?.message || "Failed to update user permissions",
      );
    },
  });

  const handlePermissionsChange = (e) => {
    const selectedPermissionIds = e.target.value;
    const previousPermissionIds = permissions.map((p) => p.permissionId);
    const newlyAddedPermissions = selectedPermissionIds.filter(
      (id) => !previousPermissionIds.includes(id),
    );

    // Check if any newly added permission has dependencies
    if (newlyAddedPermissions.length > 0) {
      const firstNewPermission = newlyAddedPermissions[0];
      const newPermissionObj = availablePermissions.find(
        (p) => p.permissionId === firstNewPermission,
      );

      const rule = PERMISSION_DEPENDENCY_RULES.find(
        (r) => newPermissionObj?.key === r.dependent,
      );

      if (rule) {
        // Find the dependent permissions that need to be auto-selected
        const allDependentPermissions = availablePermissions.filter(
          (permission) => rule.requires.includes(permission.key),
        );

        // Check which dependent permissions are NOT already selected
        const unselectedDependencies = allDependentPermissions.filter(
          (permission) =>
            !previousPermissionIds.includes(permission.permissionId),
        );

        // Only show dialog if there are unselected dependencies
        if (unselectedDependencies.length > 0) {
          // Store the new permission ID so we can complete the action after confirmation
          setDependencyDialog({
            isOpen: true,
            newPermissionId: firstNewPermission,
            dependentPermissions: unselectedDependencies,
          });
          return;
        }
      }
    }

    updatePermissions(selectedPermissionIds);
  };

  // Helper function to get all permissions that depend on a given permission
  const getInvalidatedDependents = (removedPermissionKey, allPermissions) => {
    const invalidated = [];
    const queue = [removedPermissionKey];
    const processed = new Set();

    while (queue.length > 0) {
      const currentKey = queue.shift();
      if (processed.has(currentKey)) continue;
      processed.add(currentKey);

      // Find all rules where currentKey is in the 'requires' array
      const dependentRules = PERMISSION_DEPENDENCY_RULES.filter((rule) =>
        rule.requires.includes(currentKey),
      );

      // Add all dependent permissions to invalidated list
      dependentRules.forEach((rule) => {
        const dependentPermission = allPermissions.find(
          (p) => p.key === rule.dependent,
        );
        if (dependentPermission) {
          invalidated.push(dependentPermission.permissionId);
          queue.push(rule.dependent); // Check for cascading dependencies
        }
      });
    }

    return invalidated;
  };

  const updatePermissions = (selectedPermissionIds) => {
    setPermissions((prev) => {
      const updatedPermissions = selectedPermissionIds.map((permissionId) => {
        const existing = prev.find(
          (item) => item.permissionId === permissionId,
        );
        const permissionMeta = availablePermissions.find(
          (item) => item.permissionId === permissionId,
        );

        return (
          existing || {
            permissionId,
            key: permissionMeta?.key,
            name: permissionMeta?.name,
            isGranted: false,
          }
        );
      });

      return updatedPermissions;
    });

    setHasChanges(true);
  };

  const handleDependencyConfirm = () => {
    // Add the newly selected permission and its dependencies
    const currentPermissionIds = permissions.map((p) => p.permissionId);
    const dependentPermissionIds = dependencyDialog.dependentPermissions.map(
      (p) => p.permissionId,
    );
    const allSelectedIds = [
      ...currentPermissionIds,
      dependencyDialog.newPermissionId,
      ...dependentPermissionIds,
    ];

    // Remove duplicates
    const uniqueIds = [...new Set(allSelectedIds)];

    updatePermissions(uniqueIds);

    // Close the dialog
    setDependencyDialog({
      isOpen: false,
      newPermissionId: null,
      dependentPermissions: [],
    });
  };

  const handleDependencyCancel = () => {
    setDependencyDialog({
      isOpen: false,
      newPermissionId: null,
      dependentPermissions: [],
    });
  };

  const handlePermissionGrantToggle = (permissionId) => {
    setPermissions((prev) =>
      prev.map((permission) =>
        permission.permissionId === permissionId
          ? { ...permission, isGranted: !permission.isGranted }
          : permission,
      ),
    );

    setHasChanges(true);
  };

  const handleUpdate = () => {
    const payload = {
      permissions: permissions.map((permission) => ({
        permissionId: permission.permissionId,
        isGranted: permission.isGranted,
      })),
    };

    updatePermissionsMutation.mutate({
      adminId,
      data: payload,
    });
  };

  const handleCancel = () => {
    setPermissions(JSON.parse(JSON.stringify(originalPermissions)));
    setHasChanges(false);
  };

  const selectedPermissionRecords = permissions.map((permission) => {
    const permissionMeta = availablePermissions.find(
      (item) => item.permissionId === permission.permissionId,
    );

    return {
      permissionId: permission.permissionId,
      name:
        permissionMeta?.name ||
        permission.name ||
        permission.key ||
        permission.permissionId,
      isGranted: permission.isGranted,
    };
  });

  return (
    <DashboardContent>
      <FormHeader>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <IoArrowBack
            onClick={() => navigate(-1)}
            style={{
              fontSize: "24px",
              cursor: "pointer",
              color: "#374151",
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#ed8b00")}
            onMouseLeave={(e) => (e.target.style.color = "#374151")}
            title="Go back"
          />
          <h2>Admin Details</h2>
        </div>
      </FormHeader>

      <FormContainer isvisible={true}>
        <FormGrid>
          <Input
            label="First Name"
            name="firstName"
            value={userFormData.firstName}
            onChange={() => {}}
            placeholder="Enter first name"
            disabled
          />
          <Input
            label="Last Name"
            name="lastName"
            value={userFormData.lastName}
            onChange={() => {}}
            placeholder="Enter last name"
            disabled
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={userFormData.email}
            onChange={() => {}}
            placeholder="Enter email address"
            disabled
          />
          <MultiSelectDropdown
            label="Permissions"
            name="permissions"
            value={permissions.map((permission) => permission.permissionId)}
            onChange={handlePermissionsChange}
            placeholder={
              isLoadingPermissions
                ? "Loading permissions..."
                : "Select permissions"
            }
            disabled={isLoadingPermissions || !canUpdateAdmin}
            options={
              availablePermissions.map((permission) => ({
                value: permission.permissionId,
                label: permission.name,
              })) || []
            }
          />
        </FormGrid>
      </FormContainer>

      <FormHeader style={{ marginTop: "32px" }}>
        <h2>Admin Permissions</h2>
      </FormHeader>

      <TableContainer style={{ marginTop: "24px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Permission Name</TableHeader>
              <TableHeader style={{ textAlign: "center" }}>Enabled</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoadingPermissions ? (
              <TableRow>
                <TableCell
                  colSpan={2}
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#9ca3af",
                  }}
                >
                  Loading permissions...
                </TableCell>
              </TableRow>
            ) : isPermissionsError ? (
              <TableRow>
                <TableCell
                  colSpan={2}
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#dc2626",
                  }}
                >
                  Error loading permissions:{" "}
                  {permissionsError?.message || "Unknown error"}
                </TableCell>
              </TableRow>
            ) : selectedPermissionRecords.length > 0 ? (
              selectedPermissionRecords.map((permission) => (
                <TableRow key={permission.permissionId}>
                  <TableCell>{permission.name}</TableCell>
                  <TableCell style={{ textAlign: "center" }}>
                    <SwitchContainer style={{ justifyContent: "center" }}>
                      <Switch>
                        <SwitchInput
                          type="checkbox"
                          checked={permission.isGranted}
                          disabled={!canUpdateAdmin}
                          onChange={() =>
                            handlePermissionGrantToggle(permission.permissionId)
                          }
                        />
                        <SwitchSlider />
                      </Switch>
                    </SwitchContainer>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={2}
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#9ca3af",
                  }}
                >
                  No permissions selected
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {canUpdateAdmin && (
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
            marginTop: "16px",
          }}
        >
          <SecondaryButton
            onClick={handleCancel}
            disabled={!hasChanges || updatePermissionsMutation.isPending}
          >
            Cancel
          </SecondaryButton>

          <PrimaryButton
            onClick={handleUpdate}
            disabled={!hasChanges || !canUpdateAdmin}
            isLoading={updatePermissionsMutation.isPending}
          >
            Update
          </PrimaryButton>
        </div>
      )}

      <ConfirmDialog
        isOpen={dependencyDialog.isOpen}
        title="Permission Dependencies"
        message={
          <>
            <div style={{ marginBottom: "12px" }}>
              Enabling{" "}
              <strong>
                {availablePermissions.find(
                  (p) => p.permissionId === dependencyDialog.newPermissionId,
                )?.name || "this permission"}
              </strong>{" "}
              requires the following permissions to also be enabled:
            </div>
            <ul style={{ marginLeft: "20px", marginBottom: "12px" }}>
              {dependencyDialog.dependentPermissions.map((permission) => (
                <li key={permission.permissionId}>{permission.name}</li>
              ))}
            </ul>
          </>
        }
        onConfirm={handleDependencyConfirm}
        onClose={handleDependencyCancel}
        confirmText="Enable All"
        cancelText="Cancel"
        variant="info"
      />
    </DashboardContent>
  );
};

export default UserDetails;
