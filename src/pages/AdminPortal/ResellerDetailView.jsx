import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IoArrowBack } from "react-icons/io5";
import { DashboardContent } from "../../styles/AdminPortal/Dashboard.styled";
import {
  getResellerPermissionsListAPI,
  updateResellerAPI,
  updateResellerStatusAPI,
} from "../../api/AdminPortal/ResellerApi";
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
  FormHeader,
  FormContainer,
  FormGrid,
  FormActions,
} from "../../styles/AdminPortal/Form.styled";
import { PrimaryButton, SecondaryButton } from "../../components/AdminPortal/Button";
import Input from "../../components/AdminPortal/Input";
import MultiSelectDropdown from "../../components/AdminPortal/MultiSelectDropdown";
import { Switch, SwitchInput, SwitchSlider } from "../../styles/AdminPortal/Security.styled";
import Toast from "../../utility/AdminPortal/Toast";
import ConfirmDialog from "../../components/AdminPortal/ConfirmDialog";
import { useAuth } from "../../hooks/AdminPortal/useAuth";
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
  { dependent: ROLES.LOCATIONS_DELETE, requires: [ROLES.LOCATIONS_VIEW] },
  { dependent: ROLES.LOCATIONS_UPDATE, requires: [ROLES.LOCATIONS_VIEW] },
  { dependent: ROLES.REPORTING_EXPORT, requires: [ROLES.REPORTING_VIEW] },
  { dependent: ROLES.SETTINGS_EDIT, requires: [ROLES.SETTINGS_VIEW] },
  { dependent: ROLES.USERS_EDIT, requires: [ROLES.USERS_VIEW] },
  { dependent: ROLES.USERS_INVITE, requires: [ROLES.USERS_VIEW] },
  { dependent: ROLES.USERS_REMOVE, requires: [ROLES.USERS_VIEW] },
  { dependent: ROLES.TENANTS_CREATE, requires: [ROLES.TENANTS_VIEW] },
  { dependent: ROLES.TENANTS_DEACTIVATE, requires: [ROLES.TENANTS_VIEW] },
  { dependent: ROLES.TENANTS_DELETE, requires: [ROLES.TENANTS_VIEW] },
];

const ResellerDetailView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const resellerId = searchParams.get("resellerId");
  const { hasPermission } = useAuth();
  const canDeactivateReseller = hasPermission(ROLES.RESELLERS_DEACTIVATE);
  const canUpdateReseller = hasPermission(ROLES.RESELLERS_UPDATE);

  const [resellerForm, setResellerForm] = useState({
    name: "",
    email: "",
    contactName: "",
    phoneNumber: "",
    resellerId: "",
    isActive: true,
    tenantCount: 0,
  });
  const [permissionRows, setPermissionRows] = useState([]);
  const [featureRows, setFeatureRows] = useState([]);
  const [selectedNewTenantPermissionIds, setSelectedNewTenantPermissionIds] =
    useState([]);
  const [
    selectedNewResellerPermissionIds,
    setSelectedNewResellerPermissionIds,
  ] = useState([]);
  const [selectedNewTenantFeatureIds, setSelectedNewTenantFeatureIds] =
    useState([]);
  const [selectedNewResellerFeatureIds, setSelectedNewResellerFeatureIds] =
    useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [statusDialog, setStatusDialog] = useState({
    isOpen: false,
    nextIsActive: null,
  });
  const [dependencyDialog, setDependencyDialog] = useState({
    isOpen: false,
    newPermissionId: null,
    dependentPermissions: [],
  });

  const { data: assignableListsData, isLoading: isLoadingAssignableLists } =
    useQuery({
      queryKey: ["resellerAssignableLists"],
      queryFn: getResellerPermissionsListAPI,
      enabled: !!resellerId,
      retry: false,
    });

  const reseller = location.state?.reseller;

  const assignableSource =
    assignableListsData?.data ||
    assignableListsData?.json ||
    assignableListsData ||
    {};

  const permissionsByCategory = assignableSource?.permissionsByCategory || [];
  const featuresByType = assignableSource?.featuresByType || [];

  const allAssignablePermissions = useMemo(
    () => permissionsByCategory.flatMap((group) => group.items || []),
    [permissionsByCategory],
  );

  const allAssignableFeatures = useMemo(
    () => featuresByType.flatMap((group) => group.items || []),
    [featuresByType],
  );

  const permissionByIdMap = useMemo(
    () =>
      new Map(
        allAssignablePermissions.map((permission) => [
          permission.permissionId,
          permission,
        ]),
      ),
    [allAssignablePermissions],
  );

  const permissionByKeyMap = useMemo(
    () =>
      new Map(
        allAssignablePermissions.map((permission) => [
          permission.key,
          permission,
        ]),
      ),
    [allAssignablePermissions],
  );

  const featureByIdMap = useMemo(
    () =>
      new Map(allAssignableFeatures.map((feature) => [feature.id, feature])),
    [allAssignableFeatures],
  );

  const featureByKeyMap = useMemo(
    () =>
      new Map(allAssignableFeatures.map((feature) => [feature.key, feature])),
    [allAssignableFeatures],
  );

  const updateResellerMutation = useMutation({
    mutationFn: updateResellerAPI,
    onSuccess: () => {
      Toast.success("Reseller updated successfully");
      queryClient.invalidateQueries({ queryKey: ["resellers"] });
      setSelectedNewTenantPermissionIds([]);
      setSelectedNewResellerPermissionIds([]);
      setSelectedNewTenantFeatureIds([]);
      setSelectedNewResellerFeatureIds([]);
      setHasChanges(false);
    },
    onError: (error) => {
      Toast.error(
        error?.response?.data?.message || "Failed to update reseller",
      );
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateResellerStatusAPI,
    onSuccess: (data) => {
      Toast.success(
        `Reseller ${statusDialog.nextIsActive ? "activated" : "deactivated"} successfully`,
      );
      setResellerForm((prev) => ({
        ...prev,
        isActive: statusDialog.nextIsActive,
      }));
      setStatusDialog({ isOpen: false, nextIsActive: null });
      queryClient.invalidateQueries({ queryKey: ["resellers"] });
    },
    onError: (error) => {
      Toast.error(
        error?.response?.data?.message || "Failed to update reseller status",
      );
      setStatusDialog({ isOpen: false, nextIsActive: null });
    },
  });

  useEffect(() => {
    setIsInitialized(false);
    setHasChanges(false);
    setSelectedNewTenantPermissionIds([]);
    setSelectedNewResellerPermissionIds([]);
    setSelectedNewTenantFeatureIds([]);
    setSelectedNewResellerFeatureIds([]);
  }, [resellerId]);

  useEffect(() => {
    if (!reseller || isInitialized) {
      return;
    }

    setResellerForm({
      name: reseller.name || "",
      email: reseller.email || "",
      contactName: reseller.contactName || "",
      phoneNumber: reseller.phoneNumber || "",
      resellerId: reseller.resellerId || "",
      isActive: reseller.isActive ?? true,
      tenantCount: reseller.tenantCount ?? 0,
    });

    setPermissionRows(
      (reseller.permissions || []).map((permission) => ({
        permissionId:
          permission.permissionId ||
          permissionByKeyMap.get(permission.key)?.permissionId ||
          null,
        key:
          permission.key || permissionByIdMap.get(permission.permissionId)?.key,
        isGranted: !!permission.isGranted,
      })),
    );

    setFeatureRows(
      (reseller.features || []).map((feature) => ({
        featureId:
          feature.featureId || featureByKeyMap.get(feature.key)?.id || null,
        key: feature.key || featureByIdMap.get(feature.featureId)?.key,
        isEnabled: !!feature.isEnabled,
      })),
    );

    setIsInitialized(true);
  }, [
    reseller,
    isInitialized,
    permissionByKeyMap,
    permissionByIdMap,
    featureByKeyMap,
    featureByIdMap,
  ]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    setPermissionRows((prev) =>
      prev.map((permission) => {
        if (permission.permissionId) {
          return permission;
        }

        const permissionMeta = permissionByKeyMap.get(permission.key);
        return permissionMeta
          ? { ...permission, permissionId: permissionMeta.permissionId }
          : permission;
      }),
    );

    setFeatureRows((prev) =>
      prev.map((feature) => {
        if (feature.featureId) {
          return feature;
        }

        const featureMeta = featureByKeyMap.get(feature.key);
        return featureMeta
          ? { ...feature, featureId: featureMeta.id }
          : feature;
      }),
    );
  }, [isInitialized, permissionByKeyMap, featureByKeyMap]);

  const permissions = permissionRows;
  const features = featureRows;

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setResellerForm((prev) => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handlePermissionToggle = (rowKey) => {
    setPermissionRows((prev) =>
      prev.map((permission) =>
        permission.key === rowKey
          ? { ...permission, isGranted: !permission.isGranted }
          : permission,
      ),
    );
    setHasChanges(true);
  };

  const handleFeatureToggle = (rowKey) => {
    setFeatureRows((prev) =>
      prev.map((feature) =>
        feature.key === rowKey
          ? { ...feature, isEnabled: !feature.isEnabled }
          : feature,
      ),
    );
    setHasChanges(true);
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
        const dependentPermission = allAssignablePermissions.find(
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

  const addPermissionsToRows = (selectedIds) => {
    // Check for permission dependencies
    if (selectedIds.length > 0) {
      const firstNewPermissionId = selectedIds[0];
      const firstPermissionMeta = permissionByIdMap.get(firstNewPermissionId);

      const rule = PERMISSION_DEPENDENCY_RULES.find(
        (r) => firstPermissionMeta?.key === r.dependent,
      );

      if (rule) {
        // Get existing permission IDs to check if dependencies are already selected
        const existingIds = new Set(
          permissionRows.map((item) => item.permissionId).filter(Boolean),
        );

        // Find the dependent permissions that need to be auto-selected
        const allDependentPermissions = allAssignablePermissions.filter(
          (permission) => rule.requires.includes(permission.key),
        );

        // Check which dependent permissions are NOT already selected
        const unselectedDependencies = allDependentPermissions.filter(
          (permission) => !existingIds.has(permission.permissionId),
        );

        // Only show dialog if there are unselected dependencies
        if (unselectedDependencies.length > 0) {
          // Store the new permission ID so we can complete the action after confirmation
          setDependencyDialog({
            isOpen: true,
            newPermissionId: firstNewPermissionId,
            dependentPermissions: unselectedDependencies,
          });
          return;
        }
      }
    }

    updatePermissionsRows(selectedIds);
  };

  const updatePermissionsRows = (selectedIds) => {
    setPermissionRows((prev) => {
      // Get existing permission IDs
      const existingIds = new Set(
        prev.map((item) => item.permissionId).filter(Boolean),
      );

      // Find removed permissions
      const removedPermissions = Array.from(existingIds).filter(
        (id) => !selectedIds.includes(id),
      );

      // Get all invalidated permissions (permissions that depend on removed ones)
      let invalidatedIds = new Set();
      removedPermissions.forEach((removedId) => {
        const removedPerm = permissionByIdMap.get(removedId);
        if (removedPerm?.key) {
          const invalidated = getInvalidatedDependents(removedPerm.key);
          invalidated.forEach((id) => invalidatedIds.add(id));
        }
      });

      // Filter out invalidated permissions from the current rows
      const currentRowsFiltered = prev.filter(
        (item) => !invalidatedIds.has(item.permissionId),
      );

      // Add new permissions
      const toAdd = selectedIds
        .filter((permissionId) => !existingIds.has(permissionId))
        .map((permissionId) => {
          const permissionMeta = permissionByIdMap.get(permissionId);
          return {
            permissionId,
            key: permissionMeta?.key || permissionId,
            isGranted: true,
          };
        });

      return [...currentRowsFiltered, ...toAdd];
    });
  };

  const handleDependencyConfirm = () => {
    // Add the newly selected permission and its dependencies
    const dependentPermissionIds = dependencyDialog.dependentPermissions.map(
      (p) => p.permissionId,
    );
    const allSelectedIds = [
      dependencyDialog.newPermissionId,
      ...dependentPermissionIds,
    ];

    updatePermissionsRows(allSelectedIds);
    setHasChanges(true);

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

  const handleAddTenantPermissions = (e) => {
    const selectedIds = e.target.value;
    setSelectedNewTenantPermissionIds(selectedIds);
    updatePermissionsRows(selectedIds);

    if (selectedIds.length > 0) {
      setHasChanges(true);
    }
  };

  const handleAddResellerPermissions = (e) => {
    const selectedIds = e.target.value;
    setSelectedNewResellerPermissionIds(selectedIds);
    updatePermissionsRows(selectedIds);

    if (selectedIds.length > 0) {
      setHasChanges(true);
    }
  };

  const addFeaturesToRows = (selectedIds) => {
    setFeatureRows((prev) => {
      const existingIds = new Set(
        prev.map((item) => item.featureId).filter(Boolean),
      );

      const toAdd = selectedIds
        .filter((featureId) => !existingIds.has(featureId))
        .map((featureId) => {
          const featureMeta = featureByIdMap.get(featureId);
          return {
            featureId,
            key: featureMeta?.key || featureId,
            isEnabled: true,
          };
        });

      return [...prev, ...toAdd];
    });
  };

  const handleAddTenantFeatures = (e) => {
    const selectedIds = e.target.value;
    setSelectedNewTenantFeatureIds(selectedIds);
    addFeaturesToRows(selectedIds);

    if (selectedIds.length > 0) {
      setHasChanges(true);
    }
  };

  const handleAddResellerFeatures = (e) => {
    const selectedIds = e.target.value;
    setSelectedNewResellerFeatureIds(selectedIds);
    addFeaturesToRows(selectedIds);

    if (selectedIds.length > 0) {
      setHasChanges(true);
    }
  };

  const handleStatusToggle = () => {
    setStatusDialog({
      isOpen: true,
      nextIsActive: !resellerForm.isActive,
    });
  };

  const handleConfirmStatusChange = () => {
    updateStatusMutation.mutate({
      resellerId,
      isActive: statusDialog.nextIsActive,
    });
  };

  const handleCancelStatusChange = () => {
    setStatusDialog({ isOpen: false, nextIsActive: null });
  };

  const handleUpdate = () => {
    const permissionsPayload = permissions
      .map((permission) => {
        const resolvedPermissionId =
          permission.permissionId ||
          permissionByKeyMap.get(permission.key)?.permissionId;

        if (!resolvedPermissionId) {
          return null;
        }

        return {
          permissionId: resolvedPermissionId,
          isGranted: !!permission.isGranted,
        };
      })
      .filter(Boolean);

    const featuresPayload = features
      .map((feature) => {
        const resolvedFeatureId =
          feature.featureId || featureByKeyMap.get(feature.key)?.id;

        if (!resolvedFeatureId) {
          return null;
        }

        return {
          featureId: resolvedFeatureId,
          isEnabled: !!feature.isEnabled,
        };
      })
      .filter(Boolean);

    updateResellerMutation.mutate({
      resellerId,
      data: {
        name: resellerForm.name,
        contactName: resellerForm.contactName,
        phoneNumber: resellerForm.phoneNumber,
        permissions: permissionsPayload,
        features: featuresPayload,
      },
    });
  };

  const selectedPermissionIds = [
    ...selectedNewTenantPermissionIds,
    ...selectedNewResellerPermissionIds,
  ];

  const selectedFeatureIds = [
    ...selectedNewTenantFeatureIds,
    ...selectedNewResellerFeatureIds,
  ];

  const tenantPermissionOptions =
    permissionsByCategory
      .find((permissionGroup) => permissionGroup.category === "account")
      ?.items?.filter(
        (permission) =>
          !permissions.some(
            (item) => item.permissionId === permission.permissionId,
          ) || selectedPermissionIds.includes(permission.permissionId),
      )
      ?.map((permission) => ({
        value: permission.permissionId,
        label: permission.name,
      })) || [];

  const resellerPermissionOptions =
    permissionsByCategory
      .find((permissionGroup) => permissionGroup.category === "reseller")
      ?.items?.filter(
        (permission) =>
          !permissions.some(
            (item) => item.permissionId === permission.permissionId,
          ) || selectedPermissionIds.includes(permission.permissionId),
      )
      ?.map((permission) => ({
        value: permission.permissionId,
        label: permission.name,
      })) || [];

  const tenantFeatureOptions =
    featuresByType
      .find((featureGroup) => featureGroup.featureType === "PlanGated")
      ?.items?.filter(
        (feature) =>
          !features.some((item) => item.featureId === feature.id) ||
          selectedFeatureIds.includes(feature.id),
      )
      ?.map((feature) => ({
        value: feature.id,
        label: feature.name,
      })) || [];

  const resellerFeatureOptions =
    featuresByType
      .find((featureGroup) => featureGroup.featureType === "Reseller")
      ?.items?.filter(
        (feature) =>
          !features.some((item) => item.featureId === feature.id) ||
          selectedFeatureIds.includes(feature.id),
      )
      ?.map((feature) => ({
        value: feature.id,
        label: feature.name,
      })) || [];

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
          <h2>Reseller Details</h2>
        </div>
      </FormHeader>

      {reseller ? (
        <>
          <FormContainer isvisible={canUpdateReseller}>
            <FormGrid>
              <Input
                label="Reseller Name"
                name="name"
                value={resellerForm.name}
                onChange={handleFormChange}
                placeholder="Enter reseller name"
              />
              <Input
                label="Contact Name"
                name="contactName"
                value={resellerForm.contactName}
                onChange={handleFormChange}
                placeholder="Enter contact person name"
              />
              <Input
                label="Phone Number"
                name="phoneNumber"
                value={resellerForm.phoneNumber}
                onChange={handleFormChange}
                placeholder="Enter phone number"
              />
              <Input
                label="Email"
                name="email"
                value={resellerForm.email}
                onChange={() => {}}
                placeholder="Email"
                disabled
              />
              <MultiSelectDropdown
                label="Tenant Permissions"
                name="addTenantPermissions"
                value={selectedNewTenantPermissionIds}
                onChange={handleAddTenantPermissions}
                placeholder={
                  isLoadingAssignableLists
                    ? "Loading permissions..."
                    : "Select tenant permissions"
                }
                disabled={isLoadingAssignableLists}
                options={tenantPermissionOptions}
              />
              <MultiSelectDropdown
                label="Reseller Permissions"
                name="addResellerPermissions"
                value={selectedNewResellerPermissionIds}
                onChange={handleAddResellerPermissions}
                placeholder={
                  isLoadingAssignableLists
                    ? "Loading permissions..."
                    : "Select reseller permissions"
                }
                disabled={isLoadingAssignableLists}
                options={resellerPermissionOptions}
              />
              <MultiSelectDropdown
                label="Tenant Features"
                name="addTenantFeatures"
                value={selectedNewTenantFeatureIds}
                onChange={handleAddTenantFeatures}
                placeholder={
                  isLoadingAssignableLists
                    ? "Loading features..."
                    : "Select tenant features"
                }
                disabled={isLoadingAssignableLists}
                options={tenantFeatureOptions}
              />
              <MultiSelectDropdown
                label="Reseller Features"
                name="addResellerFeatures"
                value={selectedNewResellerFeatureIds}
                onChange={handleAddResellerFeatures}
                placeholder={
                  isLoadingAssignableLists
                    ? "Loading features..."
                    : "Select reseller features"
                }
                disabled={isLoadingAssignableLists}
                options={resellerFeatureOptions}
              />
            </FormGrid>
          </FormContainer>

          <TableContainer style={{ marginTop: "24px" }}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableHeader style={{ width: "220px" }}>Name</TableHeader>
                  <TableCell>{reseller.name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHeader>Email</TableHeader>
                  <TableCell>{reseller.email}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHeader>Reseller ID</TableHeader>
                  <TableCell>{reseller.resellerId}</TableCell>
                </TableRow>
                <TableRow>
                  <TableHeader>Active</TableHeader>
                  <TableCell>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-start",
                        alignItems: "center",
                      }}
                    >
                      <Switch>
                        <SwitchInput
                          type="checkbox"
                          checked={resellerForm.isActive}
                          onChange={handleStatusToggle}
                          disabled={
                            updateStatusMutation.isPending ||
                            !canDeactivateReseller
                          }
                        />
                        <SwitchSlider />
                      </Switch>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableHeader>Tenant Count</TableHeader>
                  <TableCell>{reseller.tenantCount ?? 0}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <FormHeader style={{ marginTop: "32px" }}>
            <h2>Permissions</h2>
          </FormHeader>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Permission Key</TableHeader>
                  <TableHeader style={{ textAlign: "center" }}>
                    Granted
                  </TableHeader>
                </TableRow>
              </TableHead>
              {/* {console.log("Rendering permissions", permissions)} */}
              <TableBody>
                {permissions.length > 0 ? (
                  permissions.map((permission, index) => (
                    <TableRow
                      key={`${permission.permissionId || permission.key}-${index}`}
                    >
                      <TableCell>
                        {permissionByKeyMap.get(permission.key)?.name ||
                          permission.key}
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
                              disabled={!canUpdateReseller}
                              onChange={() =>
                                handlePermissionToggle(permission.key)
                              }
                            />
                            <SwitchSlider />
                          </Switch>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} style={{ textAlign: "center" }}>
                      No permissions available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <FormHeader style={{ marginTop: "32px" }}>
            {/* {console.log("Rendering features", features)} */}
            <h2>Features</h2>
          </FormHeader>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Feature Key</TableHeader>
                  <TableHeader style={{ textAlign: "center" }}>
                    Enabled
                  </TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {features.length > 0 ? (
                  features.map((feature, index) => (
                    <TableRow
                      key={`${feature.featureId || feature.key}-${index}`}
                    >
                      <TableCell>
                        {featureByKeyMap.get(feature.key)?.name || feature.key}
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
                              disabled={!canUpdateReseller}
                              onChange={() => handleFeatureToggle(feature.key)}
                            />
                            <SwitchSlider />
                          </Switch>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} style={{ textAlign: "center" }}>
                      No features available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <FormActions>
            <SecondaryButton
              type="button"
              onClick={() => navigate(-1)}
              disabled={
                updateResellerMutation.isPending ||
                updateStatusMutation.isPending
              }
            >
              Back
            </SecondaryButton>
            {canUpdateReseller && (
              <PrimaryButton
                type="button"
                onClick={handleUpdate}
                isLoading={updateResellerMutation.isPending}
                disabled={!hasChanges || !canUpdateReseller}
              >
                Update
              </PrimaryButton>
            )}
          </FormActions>

          <ConfirmDialog
            isOpen={statusDialog.isOpen}
            title="Confirm Status Change"
            message={`Are you sure you want to ${statusDialog.nextIsActive ? "activate" : "deactivate"} this reseller?`}
            onConfirm={handleConfirmStatusChange}
            onCancel={handleCancelStatusChange}
            isLoading={updateStatusMutation.isPending}
          />
        </>
      ) : (
        <TableContainer style={{ marginTop: "24px" }}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell style={{ textAlign: "center" }}>
                  Reseller details not available.
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
                {permissionByIdMap.get(dependencyDialog.newPermissionId)
                  ?.name || "this permission"}
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

export default ResellerDetailView;
