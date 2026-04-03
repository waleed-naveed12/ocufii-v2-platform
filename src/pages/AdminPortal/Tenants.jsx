import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FaRegEye } from "react-icons/fa";
import { AiOutlinePlus, AiOutlineClose, AiOutlineDelete } from "react-icons/ai";
import { DashboardContent } from "../../styles/AdminPortal/Dashboard.styled";
import { MdOutlineModeEditOutline } from "react-icons/md";
import {
  getAdminTenantsAPI,
  getResellerTenantsAPI,
  getResellerFeaturePermissionsAPI,
  createTenantAPI,
  deleteTenantAPI,
} from "../../api/AdminPortal/TenantsApi";
import { useAuth } from "../../hooks/AdminPortal/useAuth";
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
import {
  FormContainer,
  FormHeader,
  FormGrid,
  FormActions,
  AddButton,
  CloseButton,
} from "../../styles/AdminPortal/Form.styled";
import Input from "../../components/AdminPortal/Input";
import MultiSelectDropdown from "../../components/AdminPortal/MultiSelectDropdown";
import SearchBar from "../../components/AdminPortal/SearchBar";
import TemporaryPasswordModal from "../../components/AdminPortal/TemporaryPasswordModal";
import ConfirmDialog from "../../components/AdminPortal/ConfirmDialog";
import {
  PrimaryButton,
  SecondaryButton,
} from "../../components/AdminPortal/Button";
import { toast } from "react-toastify";
import { formatDate } from "../../utility/AdminPortal/TimeFormat";
import { ROUTE } from "../../common/AdminPortal/Routes";
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

const Tenants = () => {
  const PAGE_SIZE = 10;
  const navigate = useNavigate();
  const { getUserRole, hasPermission } = useAuth();
  const userRole = getUserRole();
  const queryClient = useQueryClient();
  const canViewTenants = hasPermission(ROLES.TENANTS_VIEW);
  const canDeleteTenants = hasPermission(ROLES.TENANTS_DELETE);
  const canAddTenants = hasPermission(ROLES.TENANTS_CREATE);
  const canUpdateTenant = hasPermission(ROLES.TENANTS_UPDATE);

  const [showForm, setShowForm] = useState(false);
  const [passwordModal, setPasswordModal] = useState({
    isOpen: false,
    password: "",
    email: "",
  });
  const [formData, setFormData] = useState({
    ownerEmail: "",
    ownerFirstName: "",
    ownerLastName: "",
    phoneNumber: "",
    permissions: [],
    features: [],
  });
  const [errors, setErrors] = useState({});
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    tenantId: null,
    tenantName: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dependencyDialog, setDependencyDialog] = useState({
    isOpen: false,
    newPermissionId: null,
    dependentPermissions: [],
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["adminTenants", userRole],
    queryFn:
      userRole === "reseller_admin"
        ? getResellerTenantsAPI
        : getAdminTenantsAPI,
    retry: false,
  });

  const filteredTenants = useMemo(() => {
    const tenants = Array.isArray(data) ? data : [];
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return tenants;
    }

    return tenants.filter((tenant) => {
      const resellerName = (tenant.currentResellerName || "").toLowerCase();
      return resellerName.includes(normalizedSearch);
    });
  }, [data, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredTenants.length / PAGE_SIZE));

  const paginatedTenants = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredTenants.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredTenants, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const totalColumns = 4;

  const {
    data: featurePermissionsData,
    isLoading: isLoadingFeaturePermissions,
  } = useQuery({
    queryKey: ["resellerFeaturePermissions"],
    queryFn: getResellerFeaturePermissionsAPI,
    enabled: showForm && userRole === "reseller_admin",
    retry: false,
  });

  const createTenantMutation = useMutation({
    mutationFn: createTenantAPI,
    onSuccess: (response) => {
      toast.success("Tenant created successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminTenants"] });
      setShowForm(false);
      setFormData({
        ownerEmail: "",
        ownerFirstName: "",
        ownerLastName: "",
        phoneNumber: "",
        permissions: [],
        features: [],
      });
      setErrors({});

      // Show temporary password modal
      setPasswordModal({
        isOpen: true,
        password:
          response?.data?.temporaryPassword ||
          response?.temporaryPassword ||
          "",
        email: formData.ownerEmail,
      });
    },
    onError: (error) => {
      const responseData = error?.response?.data;
      const apiValidationErrors = responseData?.errors;

      if (apiValidationErrors && typeof apiValidationErrors === "object") {
        const fieldMap = {
          OwnerEmail: "ownerEmail",
          OwnerFirstName: "ownerFirstName",
          OwnerLastName: "ownerLastName",
          PhoneNumber: "phoneNumber",
        };

        const normalizedErrors = {};
        let firstErrorField = null;

        Object.entries(apiValidationErrors).forEach(([field, messages]) => {
          const key = fieldMap[field] || field;
          const messageList = Array.isArray(messages)
            ? messages.filter(Boolean)
            : [messages].filter(Boolean);

          if (messageList.length > 0) {
            normalizedErrors[key] = messageList[0];
            if (!firstErrorField) {
              firstErrorField = key;
            }
          }
        });

        if (Object.keys(normalizedErrors).length > 0) {
          setErrors(normalizedErrors);
        }

        if (firstErrorField) {
          toast.error(`Error occured due to ${firstErrorField}`);
          console.error("Create tenant validation error:", responseData);
          return;
        }
      }

      toast.error(
        responseData?.message ||
          responseData?.title ||
          "Failed to create tenant",
      );
      console.error("Create tenant error:", error);
    },
  });

  const deleteTenantMutation = useMutation({
    mutationFn: deleteTenantAPI,
    onSuccess: () => {
      toast.success("Tenant deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["adminTenants"] });
      setDeleteDialog({ isOpen: false, tenantId: null, tenantName: "" });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to delete tenant");
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePermissionsChange = (e) => {
    const { value } = e.target;
    const previousPermissionIds = formData.permissions.map(
      (p) => p.permissionId,
    );
    const newlyAddedPermissions = value.filter(
      (id) => !previousPermissionIds.includes(id),
    );

    // Check if any newly added permission has dependencies
    if (newlyAddedPermissions.length > 0) {
      const firstNewPermission = newlyAddedPermissions[0];
      const allPermissions =
        featurePermissionsData?.data?.permissionsByCategory?.flatMap(
          (cat) => cat.items || [],
        ) || [];
      const newPermissionObj = allPermissions.find(
        (p) => p.permissionId === firstNewPermission,
      );

      const rule = PERMISSION_DEPENDENCY_RULES.find(
        (r) => newPermissionObj?.key === r.dependent,
      );

      if (rule) {
        // Find the dependent permissions that need to be auto-selected
        const allDependentPermissions = allPermissions.filter((permission) =>
          rule.requires.includes(permission.key),
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

    // Apply reverse dependency filtering when removing permissions
    const removedPermissions = previousPermissionIds.filter(
      (id) => !value.includes(id),
    );
    let validValue = value;

    if (removedPermissions.length > 0) {
      const allPermissions =
        featurePermissionsData?.data?.permissionsByCategory?.flatMap(
          (cat) => cat.items || [],
        ) || [];
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

      validValue = value.filter((id) => !invalidatedIds.has(id));
    }

    updatePermissions(validValue);
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
    // Get all available permissions to check for invalidated dependencies
    const allPermissions =
      featurePermissionsData?.data?.permissionsByCategory?.flatMap(
        (cat) => cat.items || [],
      ) || [];

    // Get the current permission IDs
    const currentPermissionIds = formData.permissions.map(
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

    setFormData((prev) => ({
      ...prev,
      permissions: validSelectedIds.map((permissionId) => ({
        permissionId,
        isGranted: true,
      })),
    }));
  };

  const handleDependencyConfirm = () => {
    // Add the newly selected permission and its dependencies
    const currentPermissionIds = formData.permissions.map(
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

  const handleFeaturesChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      features: value.map((featureId) => ({
        featureId,
        isEnabled: true,
      })),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});

    if (
      !formData.ownerEmail ||
      !formData.ownerFirstName ||
      !formData.ownerLastName
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      ownerEmail: formData.ownerEmail,
      ownerFirstName: formData.ownerFirstName,
      ownerLastName: formData.ownerLastName,
      phoneNumber: formData.phoneNumber,
      permissions: formData.permissions,
      features: formData.features,
    };

    createTenantMutation.mutate(payload);
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      ownerEmail: "",
      ownerFirstName: "",
      ownerLastName: "",
      phoneNumber: "",
      permissions: [],
      features: [],
    });
    setErrors({});
  };

  const featuresByType = featurePermissionsData?.data?.featuresByType || [];
  const permissionsByCategory =
    featurePermissionsData?.data?.permissionsByCategory || [];

  const planGatedFeatureOptions =
    featuresByType
      .find((featureGroup) => featureGroup.featureType === "PlanGated")
      ?.items?.map((feature) => ({
        value: feature.id,
        label: feature.name,
      })) || [];

  const resellerFeatureOptions =
    featuresByType
      .find((featureGroup) => featureGroup.featureType === "Reseller")
      ?.items?.map((feature) => ({
        value: feature.id,
        label: feature.name,
      })) || [];

  const accountPermissionOptions =
    permissionsByCategory
      .find((permissionGroup) => permissionGroup.category === "account")
      ?.items?.map((permission) => ({
        value: permission.permissionId,
        label: permission.name,
      })) || [];

  const resellerPermissionOptions =
    permissionsByCategory
      .find((permissionGroup) => permissionGroup.category === "reseller")
      ?.items?.map((permission) => ({
        value: permission.permissionId,
        label: permission.name,
      })) || [];

  const handleViewTenant = (tenant) => {
    navigate(`${ROUTE.TENANT_DETAILS}?tenantId=${tenant.tenantId}`, {
      state: { tenant },
    });
  };

  const handleDeleteClick = (tenantId, tenantName) => {
    setDeleteDialog({
      isOpen: true,
      tenantId,
      tenantName,
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.tenantId) {
      deleteTenantMutation.mutate(deleteDialog.tenantId);
    }
  };

  const handleDeleteCancel = () => {
    if (!deleteTenantMutation.isPending) {
      setDeleteDialog({ isOpen: false, tenantId: null, tenantName: "" });
    }
  };

  if (isLoading) {
    return (
      <DashboardContent>
        <div>Loading tenants...</div>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <TableHeader2>
        <h1>Tenants</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span className="count">
            Total: {filteredTenants.length} Tenant
            {filteredTenants.length !== 1 ? "s" : ""}
          </span>
          {canAddTenants && !showForm && (
            <AddButton onClick={() => setShowForm(true)}>
              <AiOutlinePlus />
              Add Tenant
            </AddButton>
          )}
        </div>
      </TableHeader2>

      {canAddTenants && (
        <FormContainer isvisible={showForm}>
          <FormHeader>
            <h2>Add New Tenant</h2>
            <CloseButton onClick={handleCancel}>
              <AiOutlineClose />
            </CloseButton>
          </FormHeader>
          <form onSubmit={handleSubmit}>
            <FormGrid>
              <Input
                label="Owner Email"
                name="ownerEmail"
                type="email"
                value={formData.ownerEmail}
                onChange={handleInputChange}
                error={errors.ownerEmail}
                placeholder="Enter owner email"
                required
              />
              <Input
                label="First Name"
                name="ownerFirstName"
                value={formData.ownerFirstName}
                onChange={handleInputChange}
                error={errors.ownerFirstName}
                placeholder="Enter first name"
                required
              />
              <Input
                label="Last Name"
                name="ownerLastName"
                value={formData.ownerLastName}
                onChange={handleInputChange}
                error={errors.ownerLastName}
                placeholder="Enter last name"
                required
              />
              <Input
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                error={errors.phoneNumber}
                placeholder="Enter phone number"
              />
              <MultiSelectDropdown
                label="Permissions"
                name="permissions"
                value={formData.permissions.map((p) => p.permissionId)}
                onChange={handlePermissionsChange}
                placeholder={
                  isLoadingFeaturePermissions
                    ? "Loading permissions..."
                    : "Select permissions"
                }
                disabled={isLoadingFeaturePermissions}
                options={accountPermissionOptions}
                searchable={true}
                searchPlaceholder="Search Permissions..."
              />
              <MultiSelectDropdown
                label="Features"
                name="features"
                value={formData.features.map((f) => f.featureId)}
                onChange={handleFeaturesChange}
                placeholder={
                  isLoadingFeaturePermissions
                    ? "Loading features..."
                    : "Select features"
                }
                disabled={isLoadingFeaturePermissions}
                options={planGatedFeatureOptions}
                searchable={true}
                searchPlaceholder="Search features..."
              />
            </FormGrid>
            <FormActions>
              <SecondaryButton type="button" onClick={handleCancel}>
                Cancel
              </SecondaryButton>
              <PrimaryButton
                type="submit"
                isLoading={createTenantMutation.isPending}
              >
                Create Tenant
              </PrimaryButton>
            </FormActions>
          </form>
        </FormContainer>
      )}
      {canViewTenants && (
        <>
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by reseller name"
            ariaLabel="Search tenants by reseller name"
          />

          <TableContainer style={{ marginTop: "24px" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Tenant ID</TableHeader>
                  <TableHeader>Date Created</TableHeader>
                  <TableHeader>Reseller</TableHeader>
                  <TableHeader>Action</TableHeader>
                </TableRow>
              </TableHead>

              <TableBody>
                {isError ? (
                  <TableRow>
                    <TableCell
                      colSpan={totalColumns}
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#dc2626",
                      }}
                    >
                      Error loading tenants: {error?.message || "Unknown error"}
                    </TableCell>
                  </TableRow>
                ) : paginatedTenants.length > 0 ? (
                  paginatedTenants.map((tenant) => (
                    <TableRow key={tenant.tenantId}>
                      <TableCell>{tenant.fullName}</TableCell>
                      <TableCell>{formatDate(tenant.dateCreated)}</TableCell>
                      <TableCell>{tenant.currentResellerName || "-"}</TableCell>
                      <TableCell>
                        <FaRegEye
                          onClick={() => handleViewTenant(tenant)}
                          style={{
                            fontSize: "18px",
                            color: "#ed8b00",
                            cursor: "pointer",
                            transition: "color 0.2s ease",
                            marginRight: "15px",
                          }}
                          onMouseEnter={(e) =>
                            (e.target.style.color = "#d97706")
                          }
                          onMouseLeave={(e) =>
                            (e.target.style.color = "#ed8b00")
                          }
                          title="View tenant"
                        />
                        {canUpdateTenant && (
                          <MdOutlineModeEditOutline
                            onClick={() => handleViewTenant(tenant)}
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
                            title="Edit tenant"
                          />
                        )}
                        {canDeleteTenants && (
                          <AiOutlineDelete
                            onClick={() =>
                              handleDeleteClick(
                                tenant.tenantId,
                                tenant.fullName || tenant.email,
                              )
                            }
                            style={{
                              fontSize: "20px",
                              color: "#dc2626",
                              cursor: "pointer",
                              transition: "color 0.2s ease",
                            }}
                            onMouseEnter={(e) =>
                              (e.target.style.color = "#b91c1c")
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.color = "#dc2626")
                            }
                            title="Deactivate tenant"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={totalColumns}
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#9ca3af",
                      }}
                    >
                      No tenants available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {!isError && filteredTenants.length > 0 ? (
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
                {Math.min(currentPage * PAGE_SIZE, filteredTenants.length)} of{" "}
                {filteredTenants.length}
              </span>

              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
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
                    cursor:
                      currentPage === totalPages ? "not-allowed" : "pointer",
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}

      <TemporaryPasswordModal
        isOpen={passwordModal.isOpen}
        onClose={() =>
          setPasswordModal({ isOpen: false, password: "", email: "" })
        }
        password={passwordModal.password}
        email={passwordModal.email}
        title="Tenant Created Successfully"
        description="A new tenant has been created"
      />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Tenant"
        message={`Are you sure you want to delete "${deleteDialog.tenantName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteTenantMutation.isPending}
      />

      <ConfirmDialog
        isOpen={dependencyDialog.isOpen}
        title="Permission Dependencies"
        message={
          <>
            <div style={{ marginBottom: "12px" }}>
              Enabling{" "}
              <strong>
                {featurePermissionsData?.data?.permissionsByCategory
                  ?.flatMap((cat) => cat.items || [])
                  .find(
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

export default Tenants;
