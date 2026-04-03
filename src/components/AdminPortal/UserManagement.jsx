import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FormContainer,
  FormHeader,
  FormGrid,
  FormActions,
  CloseButton,
} from "../../styles/AdminPortal/Form.styled";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
} from "../../styles/AdminPortal/Table.styled";
import { AiOutlineClose } from "react-icons/ai";

import {
  SwitchContainer,
  Switch,
  SwitchInput,
  SwitchSlider,
} from "../../styles/AdminPortal/Security.styled";
import Input from "./Input";
import MultiSelectDropdown from "./MultiSelectDropdown";
import { PrimaryButton } from "./Button";
import {
  addPlatformAdminAPI,
  getPermissionsAPI,
} from "../../api/AdminPortal/UserManagementApi";
import Toast from "../../utility/AdminPortal/Toast";
import TemporaryPasswordModal from "./TemporaryPasswordModal";
import { useAuth } from "../../hooks/AdminPortal/useAuth";
import { ROLES } from "../../common/AdminPortal/Roles";
import ConfirmDialog from "./ConfirmDialog";

const buildDefaultPermissions = (permissions) =>
  permissions
    .filter((permission) => permission.isDefault)
    .map((permission) => ({
      permissionId: permission.permissionId,
      isGranted: true,
    }));

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

const UserManagement = ({
  showForm = true,
  title = "User Management",
  onCancel,
  onSuccess,
}) => {
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const canViewAdminTable = hasPermission(ROLES.PLATFORM_USERS_VIEW);

  const [userFormData, setUserFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    permissions: [],
  });

  // State for temporary password modal
  const [passwordModal, setPasswordModal] = useState({
    isOpen: false,
    password: "",
    email: "",
  });

  // State for permission dependency confirmation dialog
  const [dependencyDialog, setDependencyDialog] = useState({
    isOpen: false,
    newPermissionId: null,
    dependentPermissions: [],
  });

  const resetForm = () => {
    setUserFormData({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      permissions: buildDefaultPermissions(availablePermissions),
    });
  };

  // Fetch permissions for roles dropdown
  const { data: permissionsData, isLoading: isLoadingPermissions } = useQuery({
    queryKey: ["getPermissions"],
    queryFn: getPermissionsAPI,
    enabled: canViewAdminTable,
  });

  const availablePermissions = permissionsData?.data || [];

  useEffect(() => {
    if (availablePermissions.length === 0) {
      return;
    }

    setUserFormData((prev) => {
      if (prev.permissions.length > 0) {
        return prev;
      }

      return {
        ...prev,
        permissions: buildDefaultPermissions(availablePermissions),
      };
    });
  }, [availablePermissions]);

  // Mutation for adding platform admin
  const addAdminMutation = useMutation({
    mutationFn: addPlatformAdminAPI,
    onSuccess: (response) => {
      Toast.success("Admin user created successfully");
      queryClient.invalidateQueries({ queryKey: ["platformUsers"] });

      // Show temporary password modal
      setPasswordModal({
        isOpen: true,
        password:
          response?.temporaryPassword ||
          response?.data?.temporaryPassword ||
          "",
        email: userFormData.email,
      });

      resetForm();
      onSuccess?.();
    },
    onError: (error) => {
      Toast.error(
        error?.response?.data?.message || "Failed to create admin user",
      );
    },
  });

  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setUserFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePermissionsChange = (e) => {
    const selectedPermissionIds = e.target.value;
    const previousPermissionIds = userFormData.permissions.map(
      (p) => p.permissionId,
    );
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

    // If no dependencies, proceed with normal permission change
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
          (p) => p.permissionId === rule.dependent,
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
    // Get all available permissions to check for invalidated dependencies
    const allPermissions = availablePermissions || [];

    // Get the current permission IDs
    const currentPermissionIds = userFormData.permissions.map(
      (p) => p.permissionId,
    );

    // Find removed permission keys
    const removedPermissions = currentPermissionIds.filter(
      (id) => !selectedPermissionIds.includes(id),
    );

    // Get all invalidated permissions (permissions that depend on removed ones)
    let invalidatedIds = new Set();
    removedPermissions.forEach((removedId) => {
      const removedPerm = allPermissions.find(
        (p) => p.permissionId === removedId,
      );
      if (removedPerm?.key) {
        const invalidated = getInvalidatedDependents(
          removedPerm.key,
          allPermissions,
        );
        invalidated.forEach((id) => invalidatedIds.add(id));
      }
    });

    // Filter out invalidated permissions from selected IDs
    const validSelectedIds = selectedPermissionIds.filter(
      (id) => !invalidatedIds.has(id),
    );

    setUserFormData((prev) => ({
      ...prev,
      permissions: validSelectedIds.map((permissionId) => {
        const existingPermission = prev.permissions.find(
          (permission) => permission.permissionId === permissionId,
        );

        return (
          existingPermission || {
            permissionId,
            isGranted: true,
          }
        );
      }),
    }));
  };

  const handleDependencyConfirm = () => {
    // Add the newly selected permission and its dependencies
    const currentPermissionIds = userFormData.permissions.map(
      (p) => p.permissionId,
    );
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
    setUserFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.map((permission) =>
        permission.permissionId === permissionId
          ? { ...permission, isGranted: !permission.isGranted }
          : permission,
      ),
    }));
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();

    // Validate form
    if (
      !userFormData.firstName ||
      !userFormData.lastName ||
      !userFormData.email
    ) {
      Toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      email: userFormData.email,
      firstName: userFormData.firstName,
      lastName: userFormData.lastName,
      phoneNumber: userFormData.phoneNumber,
      permissions: userFormData.permissions,
    };

    // Call the mutation
    addAdminMutation.mutate(payload);
  };

  const handleCancel = () => {
    resetForm();
    onCancel?.();
  };

  const selectedPermissions = availablePermissions.filter((permission) =>
    userFormData.permissions.some(
      (selectedPermission) =>
        selectedPermission.permissionId === permission.permissionId,
    ),
  );

  return (
    <>
      <FormContainer isvisible={showForm}>
        <FormHeader>
          <h2>{title}</h2>
          {onCancel ? (
            <CloseButton onClick={handleCancel} type="button">
              <AiOutlineClose />
            </CloseButton>
          ) : null}
        </FormHeader>
        <form onSubmit={handleUserSubmit}>
          <FormGrid>
            <Input
              label="First Name"
              name="firstName"
              value={userFormData.firstName}
              onChange={handleUserInputChange}
              placeholder="Enter first name"
              required
            />
            <Input
              label="Last Name"
              name="lastName"
              value={userFormData.lastName}
              onChange={handleUserInputChange}
              placeholder="Enter last name"
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={userFormData.email}
              onChange={handleUserInputChange}
              placeholder="Enter email address"
              required
            />
            <Input
              label="Phone Number"
              name="phoneNumber"
              value={userFormData.phoneNumber}
              onChange={handleUserInputChange}
              placeholder="Enter phone number"
            />
            <MultiSelectDropdown
              label="Permissions"
              name="permissions"
              value={userFormData.permissions.map(
                (permission) => permission.permissionId,
              )}
              onChange={handlePermissionsChange}
              searchable
              searchPlaceholder="Search permissions"
              placeholder={
                isLoadingPermissions
                  ? "Loading permissions..."
                  : "Select permissions"
              }
              disabled={isLoadingPermissions}
              options={
                availablePermissions.map((permission) => ({
                  value: permission.permissionId,
                  label: permission.name,
                })) || []
              }
            />
          </FormGrid>

          {!canViewAdminTable && (
            <div
              style={{
                fontSize: "14px",
                color: "#dc2626",
                marginTop: "8px",
                padding: "8px 12px",
                backgroundColor: "#fee2e2",
                border: "1px solid #fecaca",
                borderRadius: "6px",
              }}
            >
              You do not have permission to view or manage permissions.
            </div>
          )}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Enabled</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedPermissions.length > 0 ? (
                  selectedPermissions.map((permission) => {
                    const selectedPermission = userFormData.permissions.find(
                      (item) => item.permissionId === permission.permissionId,
                    );

                    return (
                      <TableRow key={permission.permissionId}>
                        <TableCell>{permission.name}</TableCell>
                        <TableCell>
                          <SwitchContainer>
                            <Switch>
                              <SwitchInput
                                type="checkbox"
                                checked={selectedPermission?.isGranted || false}
                                onChange={() =>
                                  handlePermissionGrantToggle(
                                    permission.permissionId,
                                  )
                                }
                              />
                              <SwitchSlider />
                            </Switch>
                          </SwitchContainer>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} style={{ textAlign: "center" }}>
                      No permissions selected
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <FormActions>
            {onCancel ? (
              <PrimaryButton
                as="button"
                type="button"
                onClick={handleCancel}
                style={{
                  background: "transparent",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                }}
              >
                Cancel
              </PrimaryButton>
            ) : null}
            <PrimaryButton type="submit" isLoading={addAdminMutation.isPending}>
              Add
            </PrimaryButton>
          </FormActions>
        </form>
      </FormContainer>

      <TemporaryPasswordModal
        isOpen={passwordModal.isOpen}
        onClose={() =>
          setPasswordModal({ isOpen: false, password: "", email: "" })
        }
        password={passwordModal.password}
        email={passwordModal.email}
      />

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
    </>
  );
};

export default UserManagement;
