import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  StatusBadge,
} from "../../styles/AdminPortal/Table.styled";
import {
  FormContainer,
  FormGrid,
  FormHeader,
  FormActions,
} from "../../styles/AdminPortal/Form.styled";
import {
  SwitchContainer,
  Switch,
  SwitchInput,
  SwitchSlider,
} from "../../styles/AdminPortal/Security.styled";
import {
  getAdminTenantsAPI,
  getResellerTenantsAPI,
  getResellerFeaturePermissionsAPI,
  getResellersListAPI,
  moveTenantAPI,
  updateTenantAPI,
} from "../../api/AdminPortal/TenantsApi";
import { useAuth } from "../../hooks/AdminPortal/useAuth";
import { formatDate } from "../../utility/AdminPortal/TimeFormat";
import Dropdown from "../../components/AdminPortal/Dropdown";
import MultiSelectDropdown from "../../components/AdminPortal/MultiSelectDropdown";
import ConfirmDialog from "../../components/AdminPortal/ConfirmDialog";
import {
  PrimaryButton,
  SecondaryButton,
} from "../../components/AdminPortal/Button";
import Toast from "../../utility/AdminPortal/Toast";
import { ROLES } from "../../common/AdminPortal/Roles";

// Permission dependency rules - define which permissions require other permissions
// Format: { dependent: "permission.key", requires: ["permission.key1", "permission.key2"] }
const PERMISSION_DEPENDENCY_RULES = [
  { dependent: ROLES.ALERTS_ACKNOWLEDGE, requires: [ROLES.ALERTS_VIEW] },
  { dependent: ROLES.ALERTS_DELETE, requires: [ROLES.ALERTS_VIEW] },
  { dependent: ROLES.ALERTS_EXPORT, requires: [ROLES.ALERTS_VIEW] },
  { dependent: ROLES.ALERTS_RESOLVE, requires: [ROLES.ALERTS_VIEW] },
  { dependent: ROLES.ALERTS_SNOOZE, requires: [ROLES.ALERTS_VIEW] },
  { dependent: ROLES.DEVICES_ASSIGN, requires: [ROLES.DEVICES_VIEW] },
  { dependent: ROLES.DEVICES_CREATE, requires: [ROLES.DEVICES_VIEW] },
  { dependent: ROLES.DEVICES_DELETE, requires: [ROLES.DEVICES_VIEW] },
  { dependent: ROLES.DEVICES_EXPORT, requires: [ROLES.DEVICES_VIEW] },
  { dependent: ROLES.DEVICES_UPDATE, requires: [ROLES.DEVICES_VIEW] },
  { dependent: ROLES.LOCATIONS_CREATE, requires: [ROLES.LOCATIONS_VIEW] },
  { dependent: ROLES.LOCATIONS_DELETE, requires: [ROLES.LOCATIONS_VIEW] },
  { dependent: ROLES.LOCATIONS_UPDATE, requires: [ROLES.LOCATIONS_VIEW] },
  { dependent: ROLES.REPORTING_EXPORT, requires: [ROLES.REPORTING_VIEW] },
  { dependent: ROLES.SETTINGS_EDIT, requires: [ROLES.SETTINGS_VIEW] },
  { dependent: ROLES.USERS_EDIT, requires: [ROLES.USERS_VIEW] },
  { dependent: ROLES.USERS_INVITE, requires: [ROLES.USERS_VIEW] },
  { dependent: ROLES.USERS_REMOVE, requires: [ROLES.USERS_VIEW] },
];

const TenantDetails = () => {
  const { hasPermission, getUserRole } = useAuth();
  const userRole = getUserRole();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const tenantId = searchParams.get("tenantId");
  const hasTenantMovePermission = hasPermission(ROLES.TENANTS_MOVE);
  const canEditTenant = hasPermission(ROLES.TENANTS_UPDATE);

  const [selectedResellerId, setSelectedResellerId] = useState("");
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    resellerName: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    permissions: [],
    features: [],
  });
  const [dependencyDialog, setDependencyDialog] = useState({
    isOpen: false,
    newPermissionId: null,
    dependentPermissions: [],
  });

  const tenantFromState = location.state?.tenant;
  // console.log("Tenant from state:", tenantFromState);

  const { data: tenantsData } = useQuery({
    queryKey: ["adminTenants"],
    queryFn: getAdminTenantsAPI,
    enabled: !tenantFromState && !!tenantId,
    retry: false,
  });

  const { data: resellersList, isLoading: isResellersLoading } = useQuery({
    queryKey: ["resellersList"],
    queryFn: getResellersListAPI,
    enabled: hasTenantMovePermission,
    retry: false,
  });

  const {
    data: featurePermissionsData,
    isLoading: isLoadingFeaturePermissions,
  } = useQuery({
    queryKey: ["resellerFeaturePermissions"],
    queryFn: getResellerFeaturePermissionsAPI,
    enabled: isEditMode && userRole === "reseller_admin",
    retry: false,
  });

  const tenantFromList = (tenantsData || []).find(
    (tenant) => tenant.tenantId === tenantId,
  );

  const tenant = tenantFromState || tenantFromList;

  const resellerOptions = useMemo(
    () =>
      (resellersList || []).map((reseller) => ({
        value: reseller.resellerId || reseller.id,
        label:
          reseller.name ||
          reseller.resellerName ||
          reseller.email ||
          "Unknown Reseller",
      })),
    [resellersList],
  );

  const moveTenantMutation = useMutation({
    mutationFn: moveTenantAPI,
    onSuccess: () => {
      const selectedReseller = resellerOptions.find(
        (option) => option.value === selectedResellerId,
      );
      Toast.success("Tenant moved successfully");
      setConfirmDialog({ isOpen: false, resellerName: "" });
      queryClient.invalidateQueries({ queryKey: ["adminTenants"] });
      queryClient.invalidateQueries({ queryKey: ["resellers"] });

      if (tenant) {
        navigate(`${location.pathname}?tenantId=${tenant.tenantId}`, {
          replace: true,
          state: {
            tenant: {
              ...tenant,
              currentResellerName:
                selectedReseller?.label || tenant.currentResellerName,
            },
          },
        });
      }
      setSelectedResellerId("");
    },
    onError: (error) => {
      Toast.error(error?.response?.data?.message || "Failed to move tenant");
      setConfirmDialog({ isOpen: false, resellerName: "" });
    },
  });

  const updateTenantMutation = useMutation({
    mutationFn: updateTenantAPI,
    onSuccess: () => {
      Toast.success("Tenant updated successfully");
      queryClient.invalidateQueries({ queryKey: ["adminTenants"] });
      setIsEditMode(false);
      setEditFormData({
        name: "",
        permissions: [],
        features: [],
      });
    },
    onError: (error) => {
      Toast.error(error?.response?.data?.message || "Failed to update tenant");
    },
  });

  const handleResellerChange = (e) => {
    setSelectedResellerId(e.target.value);
  };

  const handleMoveClick = () => {
    const selectedReseller = resellerOptions.find(
      (option) => option.value === selectedResellerId,
    );

    setConfirmDialog({
      isOpen: true,
      resellerName: selectedReseller?.label || "selected reseller",
    });
  };

  const handleMoveConfirm = () => {
    if (!tenantId || !selectedResellerId) {
      return;
    }

    moveTenantMutation.mutate({
      tenantId,
      newResellerId: selectedResellerId,
    });
  };

  const handleMoveCancel = () => {
    if (!moveTenantMutation.isPending) {
      setConfirmDialog({ isOpen: false, resellerName: "" });
    }
  };

  const handleEditClick = () => {
    if (tenant) {
      setEditFormData({
        name: tenant.fullName || tenant.name || "",
        permissions: (tenant.permissions || []).map((p) => ({
          key: p.key,
          permissionId: p.permissionId || p.key,
          isGranted: p.isGranted,
        })),
        features: (tenant.features || []).map((f) => ({
          key: f.key,
          featureId: f.featureId || f.key,
          isEnabled: f.isEnabled,
        })),
      });
      setIsEditMode(true);
    }
  };

  const handleEditCancel = () => {
    setIsEditMode(false);
    setEditFormData({
      name: "",
      permissions: [],
      features: [],
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Helper function to get all permissions that depend on a given permission
  const getInvalidatedDependents = (removedPermissionKey) => {
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
        const dependentPermission = allAccountPermissions.find(
          (p) => p.key === rule.dependent,
        );
        if (dependentPermission) {
          invalidated.push(dependentPermission.value);
          queue.push(rule.dependent); // Check for cascading dependencies
        }
      });
    }

    return invalidated;
  };

  const handleEditPermissionsChange = (e) => {
    const { value } = e.target;
    const previousPermissionIds = editFormData.permissions.map(
      (p) => p.permissionId,
    );
    const newlyAddedPermissions = value.filter(
      (id) => !previousPermissionIds.includes(id),
    );

    // Check if any newly added permission has dependencies
    if (newlyAddedPermissions.length > 0) {
      const firstNewPermission = newlyAddedPermissions[0];
      const newPermissionObj = allAccountPermissions.find(
        (p) => p.value === firstNewPermission,
      );

      const rule = PERMISSION_DEPENDENCY_RULES.find(
        (r) => newPermissionObj?.key === r.dependent,
      );

      if (rule) {
        // Find the dependent permissions that need to be auto-selected
        const allDependentPermissions = allAccountPermissions.filter(
          (permission) => rule.requires.includes(permission.key),
        );

        // Check which dependent permissions are NOT already selected
        const unselectedDependencies = allDependentPermissions.filter(
          (permission) => !previousPermissionIds.includes(permission.value),
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

    // Apply reverse dependency filtering when removing permissions
    const removedPermissions = previousPermissionIds.filter(
      (id) => !value.includes(id),
    );
    let validValue = value;

    if (removedPermissions.length > 0) {
      let invalidatedIds = new Set();

      removedPermissions.forEach((removedId) => {
        const removedPerm = allAccountPermissions.find(
          (p) => p.value === removedId,
        );
        if (removedPerm?.key) {
          const invalidated = getInvalidatedDependents(removedPerm.key);
          invalidated.forEach((id) => invalidatedIds.add(id));
        }
      });

      validValue = value.filter((id) => !invalidatedIds.has(id));
    }

    updateEditPermissions(validValue);
  };

  const updateEditPermissions = (selectedPermissionIds) => {
    setEditFormData((prev) => ({
      ...prev,
      permissions: selectedPermissionIds.map((permissionId) => ({
        key:
          allAccountPermissions.find(
            (permission) => permission.value === permissionId,
          )?.key || permissionId,
        permissionId,
        isGranted: true,
      })),
    }));
  };

  const handleDependencyConfirm = () => {
    // Add the newly selected permission and its dependencies
    const currentPermissionIds = editFormData.permissions.map(
      (p) => p.permissionId,
    );
    const dependentPermissionIds = dependencyDialog.dependentPermissions.map(
      (p) => p.value,
    );
    const allSelectedIds = [
      ...currentPermissionIds,
      dependencyDialog.newPermissionId,
      ...dependentPermissionIds,
    ];

    // Remove duplicates
    const uniqueIds = [...new Set(allSelectedIds)];

    updateEditPermissions(uniqueIds);

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

  const handleEditFeaturesChange = (e) => {
    const { value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      features: value.map((featureId) => ({
        key:
          allPlanGatedFeatures.find((feature) => feature.value === featureId)
            ?.key || featureId,
        featureId,
        isEnabled: true,
      })),
    }));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!tenantId) return;

    updateTenantMutation.mutate({
      tenantId,
      data: editFormData,
    });
  };

  // Get already assigned permission and feature keys from tenant
  const assignedPermissionKeys = (tenant?.permissions || []).map((p) => p.key);
  const assignedFeatureKeys = (tenant?.features || []).map((f) => f.key);

  const featuresByType = featurePermissionsData?.data?.featuresByType || [];
  const permissionsByCategory =
    featurePermissionsData?.data?.permissionsByCategory || [];

  // Create all available options with name as label
  const allAccountPermissions =
    permissionsByCategory
      .find((permissionGroup) => permissionGroup.category === "account")
      ?.items?.map((permission) => ({
        value: permission.permissionId,
        label: permission.name,
        key: permission.key,
      })) || [];

  const allPlanGatedFeatures =
    featuresByType
      .find((featureGroup) => featureGroup.featureType === "PlanGated")
      ?.items?.map((feature) => ({
        value: feature.id,
        label: feature.name,
        key: feature.key,
      })) || [];

  const permissionIdByKey = useMemo(
    () =>
      new Map(
        allAccountPermissions.map((permission) => [
          permission.key,
          permission.value,
        ]),
      ),
    [allAccountPermissions],
  );

  const featureIdByKey = useMemo(
    () =>
      new Map(
        allPlanGatedFeatures.map((feature) => [feature.key, feature.value]),
      ),
    [allPlanGatedFeatures],
  );

  const permissionByKeyMap = useMemo(
    () =>
      new Map(
        allAccountPermissions.map((permission) => [permission.key, permission]),
      ),
    [allAccountPermissions],
  );

  const featureByKeyMap = useMemo(
    () =>
      new Map(allPlanGatedFeatures.map((feature) => [feature.key, feature])),
    [allPlanGatedFeatures],
  );

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    setEditFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.map((permission) => ({
        ...permission,
        permissionId:
          permission.permissionId && permission.permissionId !== permission.key
            ? permission.permissionId
            : permissionIdByKey.get(permission.key) || permission.permissionId,
      })),
      features: prev.features.map((feature) => ({
        ...feature,
        featureId:
          feature.featureId && feature.featureId !== feature.key
            ? feature.featureId
            : featureIdByKey.get(feature.key) || feature.featureId,
      })),
    }));
  }, [isEditMode, permissionIdByKey, featureIdByKey]);

  const selectedPermissionIds = editFormData.permissions.map(
    (p) => p.permissionId,
  );
  const selectedFeatureIds = editFormData.features.map((f) => f.featureId);

  // Filter out already assigned permissions and features by key
  const availableAccountPermissions = allAccountPermissions.filter(
    (permission) =>
      !assignedPermissionKeys.includes(permission.key) ||
      selectedPermissionIds.includes(permission.value),
  );

  const availablePlanGatedFeatures = allPlanGatedFeatures.filter(
    (feature) =>
      !assignedFeatureKeys.includes(feature.key) ||
      selectedFeatureIds.includes(feature.value),
  );

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
          <h2>Tenant Details</h2>
        </div>
      </FormHeader>

      {tenant ? (
        <>
          <TableContainer style={{ marginTop: "24px" }}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableHeader style={{ width: "220px" }}>
                    Tenant ID
                  </TableHeader>
                  <TableCell>{tenant.tenantId}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHeader style={{ width: "220px" }}>
                    Tenant Name
                  </TableHeader>
                  <TableCell>{tenant.fullName}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHeader style={{ width: "220px" }}>
                    Tenant Email
                  </TableHeader>
                  <TableCell>{tenant.email}</TableCell>
                </TableRow>

                <TableRow>
                  <TableHeader>Status</TableHeader>
                  <TableCell>
                    <StatusBadge status={tenant.isActive}>
                      {tenant.isActive ? "Active" : "Inactive"}
                    </StatusBadge>
                  </TableCell>
                </TableRow>
                {userRole !== "reseller_admin" && (
                  <TableRow>
                    <TableHeader>Current Reseller</TableHeader>
                    <TableCell>{tenant.currentResellerName || "-"}</TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableHeader>Date Created</TableHeader>
                  <TableCell>{formatDate(tenant.dateCreated)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHeader>Date Updated</TableHeader>
                  <TableCell>{formatDate(tenant.dateUpdated)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {ROLES.RESELLER_ADMIN && (
            <>
              <FormHeader style={{ marginTop: "32px" }}>
                <h2>Permissions & Features</h2>
              </FormHeader>
              {!isEditMode ? (
                <>
                  <FormHeader
                    style={{ marginTop: "24px", marginBottom: "12px" }}
                  >
                    <h3>Current Permissions</h3>
                  </FormHeader>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableHeader>Permission Name</TableHeader>
                          <TableHeader style={{ textAlign: "center" }}>
                            Granted
                          </TableHeader>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(tenant?.permissions || []).length > 0 ? (
                          (tenant?.permissions || []).map(
                            (permission, index) => (
                              <TableRow key={`${permission.key}-${index}`}>
                                <TableCell>
                                  {permissionByKeyMap.get(permission.key)
                                    ?.label || permission.key}
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
                                        checked={permission.isGranted}
                                        disabled={!canEditTenant}
                                      />
                                      <SwitchSlider />
                                    </Switch>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ),
                          )
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={2}
                              style={{ textAlign: "center" }}
                            >
                              No permissions available
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <FormHeader
                    style={{ marginTop: "24px", marginBottom: "12px" }}
                  >
                    <h3>Current Features</h3>
                  </FormHeader>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableHeader>Feature Name</TableHeader>
                          <TableHeader style={{ textAlign: "center" }}>
                            Enabled
                          </TableHeader>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(tenant?.features || []).length > 0 ? (
                          (tenant?.features || []).map((feature, index) => (
                            <TableRow key={`${feature.key}-${index}`}>
                              <TableCell>
                                {featureByKeyMap.get(feature.key)?.label ||
                                  feature.key}
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
                                      checked={feature.isEnabled}
                                      disabled={!canEditTenant}
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
                              colSpan={2}
                              style={{ textAlign: "center" }}
                            >
                              No features available
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <FormActions style={{ marginTop: "24px" }}>
                    {canEditTenant && (
                      <PrimaryButton type="button" onClick={handleEditClick}>
                        Edit Permissions & Features
                      </PrimaryButton>
                    )}
                  </FormActions>
                </>
              ) : (
                <FormContainer isvisible={true} style={{ marginTop: "24px" }}>
                  <FormHeader>
                    <h3>Add or Update Permissions & Features</h3>
                  </FormHeader>
                  <form onSubmit={handleEditSubmit}>
                    <FormGrid>
                      <MultiSelectDropdown
                        label="Permissions"
                        name="permissions"
                        value={selectedPermissionIds}
                        onChange={handleEditPermissionsChange}
                        placeholder={
                          isLoadingFeaturePermissions
                            ? "Loading permissions..."
                            : "Select permissions"
                        }
                        disabled={isLoadingFeaturePermissions}
                        options={availableAccountPermissions}
                        searchable
                        searchPlaceholder="Search permissions"
                      />
                      <MultiSelectDropdown
                        label="Features"
                        name="features"
                        value={selectedFeatureIds}
                        onChange={handleEditFeaturesChange}
                        placeholder={
                          isLoadingFeaturePermissions
                            ? "Loading features..."
                            : "Select features"
                        }
                        disabled={isLoadingFeaturePermissions}
                        options={availablePlanGatedFeatures}
                        searchable
                        searchPlaceholder="Search features"
                      />
                    </FormGrid>
                    <FormActions>
                      <SecondaryButton
                        type="button"
                        onClick={handleEditCancel}
                        disabled={updateTenantMutation.isPending}
                      >
                        Cancel
                      </SecondaryButton>
                      <PrimaryButton
                        type="submit"
                        isLoading={updateTenantMutation.isPending}
                        disabled={!canEditTenant}
                      >
                        Update Tenant
                      </PrimaryButton>
                    </FormActions>
                  </form>
                </FormContainer>
              )}
            </>
          )}

          {hasTenantMovePermission && (
            <>
              <FormContainer isvisible={true} style={{ marginTop: "24px" }}>
                <FormHeader>
                  <h2>Move Tenant</h2>
                </FormHeader>
                <FormGrid>
                  <Dropdown
                    label="Select New Reseller"
                    name="newResellerId"
                    value={selectedResellerId}
                    onChange={handleResellerChange}
                    options={resellerOptions}
                    placeholder={
                      isResellersLoading
                        ? "Loading resellers..."
                        : "Select reseller"
                    }
                    disabled={
                      isResellersLoading || moveTenantMutation.isPending
                    }
                  />
                </FormGrid>
                <FormActions>
                  <SecondaryButton
                    type="button"
                    onClick={() => navigate(-1)}
                    disabled={moveTenantMutation.isPending}
                  >
                    Back
                  </SecondaryButton>
                  <PrimaryButton
                    type="button"
                    onClick={handleMoveClick}
                    disabled={!selectedResellerId}
                    isLoading={moveTenantMutation.isPending}
                  >
                    Move Tenant
                  </PrimaryButton>
                </FormActions>
              </FormContainer>

              <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={handleMoveCancel}
                onConfirm={handleMoveConfirm}
                title="Confirm Tenant Move"
                message={`Are you sure you want to move this tenant to \"${confirmDialog.resellerName}\"?`}
                confirmText="Move"
                cancelText="Cancel"
                isLoading={moveTenantMutation.isPending}
              />
            </>
          )}
        </>
      ) : (
        <TableContainer style={{ marginTop: "24px" }}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell style={{ textAlign: "center" }}>
                  Tenant details not available.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ConfirmDialog
        isOpen={dependencyDialog.isOpen}
        title="Permission Dependencies"
        message={
          <>
            <div style={{ marginBottom: "12px" }}>
              Enabling{" "}
              <strong>
                {allAccountPermissions.find(
                  (p) => p.value === dependencyDialog.newPermissionId,
                )?.label || "this permission"}
              </strong>{" "}
              requires the following permissions to also be enabled:
            </div>
            <ul style={{ marginLeft: "20px", marginBottom: "12px" }}>
              {dependencyDialog.dependentPermissions.map((permission) => (
                <li key={permission.value}>{permission.label}</li>
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

export default TenantDetails;
