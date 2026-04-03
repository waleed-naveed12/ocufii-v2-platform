import api from "../../common/AdminPortal/ConfigAxios";
import { APIROUTES } from "../../common/AdminPortal/ApiRoutes";

export const getAdminTenantsAPI = async () => {
  const response = await api.get(APIROUTES.GET_ADMIN_TENANTS);
  return response?.data?.data || [];
};

export const getResellerTenantsAPI = async () => {
  const response = await api.get(APIROUTES.GET_RESELLER_TENANTS);
  return response?.data?.data || [];
};

export const getResellerFeaturePermissionsAPI = async () => {
  const response = await api.get(APIROUTES.GET_RESELLER_FEATURE_PERMISSIONS);
  return response.data;
};

export const createTenantAPI = async (tenantData) => {
  const response = await api.post(APIROUTES.CREATE_TENANT, tenantData);
  return response.data;
};

export const updateTenantAPI = async ({ tenantId, data }) => {
  const response = await api.patch(APIROUTES.UPDATE_TENANT(tenantId), data);
  return response.data;
};

export const deleteTenantAPI = async (tenantId) => {
  const response = await api.delete(APIROUTES.DELETE_TENANT(tenantId));
  return response.data;
};

export const getResellersListAPI = async () => {
  const response = await api.get(APIROUTES.GET_RESELLERS_LIST);
  return response?.data?.data || [];
};

export const moveTenantAPI = async ({ tenantId, newResellerId }) => {
  const response = await api.patch(APIROUTES.MOVE_TENANT(tenantId), {
    newResellerId,
  });
  return response?.data;
};
