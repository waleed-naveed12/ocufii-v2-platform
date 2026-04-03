import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getResellersAPI,
  addResellerAPI,
  getResellerPermissionsListAPI,
  deleteResellerAPI,
} from "../../api/AdminPortal/ResellerApi";
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
  StatusBadge,
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
import { toast } from "react-toastify";
import { AiOutlinePlus, AiOutlineClose, AiOutlineDelete } from "react-icons/ai";
import { FaRegEye } from "react-icons/fa";
import Input from "../../components/AdminPortal/Input";
import MultiSelectDropdown from "../../components/AdminPortal/MultiSelectDropdown";
import SearchBar from "../../components/AdminPortal/SearchBar";
import ConfirmDialog from "../../components/AdminPortal/ConfirmDialog";
import TemporaryPasswordModal from "../../components/AdminPortal/TemporaryPasswordModal";
import {
  PrimaryButton,
  SecondaryButton,
} from "../../components/AdminPortal/Button";
import { resellerSchema } from "../../validations/AdminPortal/ResellerValidation";
import { ROUTE } from "../../common/AdminPortal/Routes";
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

const Reseller = () => {
  const PAGE_SIZE = 10;
  const { hasPermission } = useAuth();
  const canViewResellerTable = hasPermission(ROLES.RESELLERS_VIEW);
  const canCreateReseller = hasPermission(ROLES.RESELLERS_CREATE);
  const canDeleteReseller = hasPermission(ROLES.RESELLERS_DELETE);
  const shouldFetchResellers = Boolean(canViewResellerTable);
  const canUpdateReseller = hasPermission(ROLES.RESELLERS_UPDATE);
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [passwordModal, setPasswordModal] = useState({
    isOpen: false,
    password: "",
    email: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactName: "",
    phoneNumber: "",
    tenantFeatures: [],
    resellerFeatures: [],
    tenantPermissions: [],
    resellerPermissions: [],
  });
  const [errors, setErrors] = useState({});
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    resellerId: null,
    resellerName: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dependencyDialog, setDependencyDialog] = useState({
    isOpen: false,
    fieldName: null,
    newPermissionId: null,
    dependentPermissions: [],
  });
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["resellers"],
    queryFn: shouldFetchResellers ? getResellersAPI : async () => [],
    enabled: shouldFetchResellers,
    retry: false,
  });

  const {
    data: assignableListsData,
    isLoading: isLoadingAssignableLists,
    error: assignableListsError,
  } = useQuery({
    queryKey: ["resellerAssignableLists"],
    queryFn: getResellerPermissionsListAPI,
    enabled: showForm,
    retry: false,
  });

  const addResellerMutation = useMutation({
    mutationFn: addResellerAPI,
    onSuccess: (response) => {
      toast.success("Reseller added successfully!");
      queryClient.invalidateQueries({ queryKey: ["resellers"] });
      setShowForm(false);
      setFormData({
        name: "",
        email: "",
        contactName: "",
        phoneNumber: "",
        tenantFeatures: [],
        resellerFeatures: [],
        tenantPermissions: [],
        resellerPermissions: [],
      });
      setErrors({});

      // Show temporary password modal
      setPasswordModal({
        isOpen: true,
        password:
          response?.data?.temporaryPassword ||
          response?.temporaryPassword ||
          "",
        email: formData.email,
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add reseller");
      console.error("Add reseller error:", error);
    },
  });

  const deleteResellerMutation = useMutation({
    mutationFn: deleteResellerAPI,
    onSuccess: () => {
      toast.success("Reseller deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["resellers"] });
      setDeleteDialog({ isOpen: false, resellerId: null, resellerName: "" });
    },
    onError: (deleteError) => {
      toast.error(
        deleteError?.response?.data?.message || "Failed to delete reseller",
      );
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleMultiSelectChange = (e) => {
    const { name, value } = e.target;

    // Check for permission dependencies only for permission fields
    if (name === "tenantPermissions" || name === "resellerPermissions") {
      const previousPermissionIds = formData[name];
      const newlyAddedPermissions = value.filter(
        (id) => !previousPermissionIds.includes(id),
      );

      // Check if any newly added permission has dependencies
      if (newlyAddedPermissions.length > 0) {
        const firstNewPermission = newlyAddedPermissions[0];
        const newPermissionObj =
          assignableListsData?.data?.permissionsByCategory
            ?.flatMap((cat) => cat.items || [])
            .find((p) => p.permissionId === firstNewPermission);

        const rule = PERMISSION_DEPENDENCY_RULES.find(
          (r) => newPermissionObj?.key === r.dependent,
        );

        if (rule) {
          // Find the dependent permissions that need to be auto-selected
          const allPermissions =
            assignableListsData?.data?.permissionsByCategory?.flatMap(
              (cat) => cat.items || [],
            ) || [];
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
              fieldName: name,
              newPermissionId: firstNewPermission,
              dependentPermissions: unselectedDependencies,
            });
            return;
          }
        }
      }

      // Apply reverse dependency filtering when removing permissions
      const previousPermissionIds_removal = formData[name];
      const removedPermissions = previousPermissionIds_removal.filter(
        (id) => !value.includes(id),
      );
      let validValue = value;

      if (removedPermissions.length > 0) {
        const allPermissions =
          assignableListsData?.data?.permissionsByCategory?.flatMap(
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

      setFormData((prev) => ({ ...prev, [name]: validValue }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDependencyConfirm = () => {
    // Add the newly selected permission and its dependencies
    const currentPermissionIds = formData[dependencyDialog.fieldName];
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

    setFormData((prev) => ({
      ...prev,
      [dependencyDialog.fieldName]: uniqueIds,
    }));

    // Close the dialog
    setDependencyDialog({
      isOpen: false,
      fieldName: null,
      newPermissionId: null,
      dependentPermissions: [],
    });
  };

  const handleDependencyCancel = () => {
    setDependencyDialog({
      isOpen: false,
      fieldName: null,
      newPermissionId: null,
      dependentPermissions: [],
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await resellerSchema.validate(formData, { abortEarly: false });

      const payload = {
        name: formData.name,
        email: formData.email,
        contactName: formData.contactName,
        phoneNumber: formData.phoneNumber,
        permissions: [
          ...formData.tenantPermissions,
          ...formData.resellerPermissions,
        ].map((permissionId) => ({
          permissionId,
          isGranted: true,
        })),
        features: [
          ...formData.tenantFeatures,
          ...formData.resellerFeatures,
        ].map((featureId) => ({
          featureId,
          isEnabled: true,
        })),
      };

      addResellerMutation.mutate(payload);
    } catch (error) {
      if (error.name === "ValidationError") {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err.message;
        });
        setErrors(validationErrors);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      name: "",
      email: "",
      contactName: "",
      phoneNumber: "",
      tenantFeatures: [],
      resellerFeatures: [],
      tenantPermissions: [],
      resellerPermissions: [],
    });
    setErrors({});
  };

  const handleDeleteClick = (resellerId, resellerName) => {
    setDeleteDialog({
      isOpen: true,
      resellerId,
      resellerName,
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.resellerId) {
      deleteResellerMutation.mutate(deleteDialog.resellerId);
    }
  };

  const handleDeleteCancel = () => {
    if (!deleteResellerMutation.isPending) {
      setDeleteDialog({ isOpen: false, resellerId: null, resellerName: "" });
    }
  };

  const handleViewClick = (reseller) => {
    navigate(`${ROUTE.RESELLER_DETAIL}?resellerId=${reseller.resellerId}`, {
      state: { reseller },
    });
  };

  const featuresByType = assignableListsData?.data?.featuresByType || [];
  const permissionsByCategory =
    assignableListsData?.data?.permissionsByCategory || [];

  const tenantFeatureOptions =
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

  const tenantPermissionOptions =
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

  const filteredResellers = useMemo(() => {
    const resellers = Array.isArray(data) ? data : [];
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return resellers;
    }

    return resellers.filter((reseller) => {
      const resellerName = (reseller.name || "").toLowerCase();
      const resellerEmail = (reseller.email || "").toLowerCase();

      return (
        resellerName.includes(normalizedSearch) ||
        resellerEmail.includes(normalizedSearch)
      );
    });
  }, [data, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredResellers.length / PAGE_SIZE),
  );

  const paginatedResellers = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredResellers.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredResellers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (canViewResellerTable && error) {
      toast.error("Error loading resellers ");
      console.error("Reseller Query Error:", error);
      console.error("Error Details:", {
        message: error.message,
        response: error.response,
        status: error.response?.status,
      });
    }
  }, [canViewResellerTable, error]);

  useEffect(() => {
    if (assignableListsError) {
      toast.error("Error loading reseller permissions and features");
      console.error("Reseller assignable list error:", assignableListsError);
    }
  }, [assignableListsError]);

  if (canViewResellerTable && isLoading) {
    return (
      <DashboardContent>
        <div>Loading resellers...</div>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <TableHeader2>
        <h1>Resellers Management</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span className="count">
            Total: {filteredResellers.length} Reseller
            {filteredResellers.length !== 1 ? "s" : ""}
          </span>
          {!showForm && canCreateReseller && (
            <AddButton onClick={() => setShowForm(true)}>
              <AiOutlinePlus />
              Add Reseller
            </AddButton>
          )}
        </div>
      </TableHeader2>

      <FormContainer isvisible={showForm}>
        <FormHeader>
          <h2>Add New Reseller</h2>
          <CloseButton onClick={handleCancel}>
            <AiOutlineClose />
          </CloseButton>
        </FormHeader>
        <form onSubmit={handleSubmit}>
          <FormGrid>
            <Input
              label="Reseller Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
              placeholder="Enter reseller name"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              placeholder="Enter email address"
            />
            <Input
              label="Contact Name"
              name="contactName"
              value={formData.contactName}
              onChange={handleInputChange}
              error={errors.contactName}
              placeholder="Enter contact person name"
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
              label="Tenant Features"
              name="tenantFeatures"
              value={formData.tenantFeatures}
              onChange={handleMultiSelectChange}
              placeholder={
                isLoadingAssignableLists
                  ? "Loading tenant features..."
                  : "Select tenant features"
              }
              disabled={isLoadingAssignableLists}
              options={tenantFeatureOptions}
              searchable={true}
              searchPlaceholder="Search Tenant Features"
            />
            <MultiSelectDropdown
              label="Reseller Features"
              name="resellerFeatures"
              value={formData.resellerFeatures}
              onChange={handleMultiSelectChange}
              placeholder={
                isLoadingAssignableLists
                  ? "Loading reseller features..."
                  : "Select reseller features"
              }
              disabled={isLoadingAssignableLists}
              options={resellerFeatureOptions}
              searchable={true}
              searchPlaceholder="Search Reseller Features"
            />
            <MultiSelectDropdown
              label="Tenant Permissions"
              name="tenantPermissions"
              value={formData.tenantPermissions}
              onChange={handleMultiSelectChange}
              placeholder={
                isLoadingAssignableLists
                  ? "Loading tenant permissions..."
                  : "Select tenant permissions"
              }
              disabled={isLoadingAssignableLists}
              options={tenantPermissionOptions}
              searchable={true}
              searchPlaceholder="Search Tenant Permissions"
            />
            <MultiSelectDropdown
              label="Reseller Permissions"
              name="resellerPermissions"
              value={formData.resellerPermissions}
              onChange={handleMultiSelectChange}
              placeholder={
                isLoadingAssignableLists
                  ? "Loading reseller permissions..."
                  : "Select reseller permissions"
              }
              disabled={isLoadingAssignableLists}
              options={resellerPermissionOptions}
              searchable={true}
              searchPlaceholder="Search Reseller Permissions"
            />
          </FormGrid>
          <FormActions>
            <SecondaryButton type="button" onClick={handleCancel}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              isLoading={addResellerMutation.isPending}
            >
              Add Reseller
            </PrimaryButton>
          </FormActions>
        </form>
      </FormContainer>

      {canViewResellerTable ? (
        <>
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email"
            ariaLabel="Search resellers by name or email"
          />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>ID</TableHeader>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Email</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Created At</TableHeader>
                  <TableHeader>Action</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedResellers.length > 0 ? (
                  paginatedResellers.map((reseller, index) => (
                    <TableRow key={reseller.resellerId}>
                      <TableCell>
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </TableCell>
                      <TableCell>{reseller.name}</TableCell>
                      <TableCell>{reseller.email}</TableCell>
                      <TableCell>
                        <StatusBadge status={reseller.isActive}>
                          {reseller.isActive ? "Active" : "Inactive"}
                        </StatusBadge>
                      </TableCell>
                      {/* <TableCell>{formatDate(reseller.createdAt)}</TableCell> */}
                      <TableCell> N/A</TableCell>
                      <TableCell>
                        <FaRegEye
                          onClick={() => handleViewClick(reseller)}
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
                          title="View reseller"
                        />
                        {canUpdateReseller && (
                          <MdOutlineModeEditOutline
                            onClick={() => handleViewClick(reseller)}
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
                        {canDeleteReseller ? (
                          <AiOutlineDelete
                            onClick={() =>
                              handleDeleteClick(
                                reseller.resellerId,
                                reseller.name,
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
                            title="Delete reseller"
                          />
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#9ca3af",
                      }}
                    >
                      No resellers available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredResellers.length > 0 ? (
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
                {Math.min(currentPage * PAGE_SIZE, filteredResellers.length)} of{" "}
                {filteredResellers.length}
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
      ) : null}

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Reseller"
        message={`Are you sure you want to delete "${deleteDialog.resellerName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteResellerMutation.isPending}
      />

      <TemporaryPasswordModal
        isOpen={passwordModal.isOpen}
        onClose={() =>
          setPasswordModal({ isOpen: false, password: "", email: "" })
        }
        password={passwordModal.password}
        email={passwordModal.email}
        title="Reseller Created Successfully"
        description="A new reseller has been created"
      />

      <ConfirmDialog
        isOpen={dependencyDialog.isOpen}
        title="Permission Dependencies"
        message={
          <>
            <div style={{ marginBottom: "12px" }}>
              Enabling{" "}
              <strong>
                {assignableListsData?.data?.permissionsByCategory
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

export default Reseller;
