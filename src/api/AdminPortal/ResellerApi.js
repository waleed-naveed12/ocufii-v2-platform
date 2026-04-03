import api from "../../common/AdminPortal/ConfigAxios";
import { APIROUTES } from "../../common/AdminPortal/ApiRoutes";

/**
 * Get all resellers
 * @returns {Promise} - Promise with resellers data
 */
export const getResellersAPI = async () => {
  const response = await api.get(APIROUTES.GET_RESELLERS);
  //   console.log("getResellersAPI response:", response);
  return response?.data?.data;
};

export const getResellerPermissionsListAPI = async () => {
  const response = await api.get(APIROUTES.GET_RESELLER_PERMISSIONS_LIST);
  return response.data;
};

/**
 * Add a new reseller
 * @param {Object} resellerData - Reseller data payload for reseller creation
 * @returns {Promise} - Promise with created reseller data
 */
export const addResellerAPI = async (resellerData) => {
  const response = await api.post(APIROUTES.ADD_RESELLERS, resellerData);
  //   console.log("addResellerAPI response:", response);
  return response.data;
};

export const deleteResellerAPI = async (resellerId) => {
  const response = await api.delete(APIROUTES.DELETE_RESELLER(resellerId));
  return response.data;
};

export const updateResellerAPI = async ({ resellerId, data }) => {
  const response = await api.patch(APIROUTES.UPDATE_RESELLER(resellerId), data);
  return response.data;
};

export const updateResellerStatusAPI = async ({ resellerId, isActive }) => {
  const response = await api.patch(
    APIROUTES.UPDATE_RESELLER_STATUS(resellerId),
    { isActive },
  );
  return response.data;
};
