import api from "../../common/AdminPortal/ConfigAxios";
import { APIROUTES } from "../../common/AdminPortal/ApiRoutes";

export const getPlatformUsersAPI = async () => {
  const response = await api.get(APIROUTES.GET_PLATFORM_USERS);
  return response.data;
};

export const changeAdminStatusAPI = async ({ adminId, isActive }) => {
  const response = await api.patch(APIROUTES.CHANGE_ADMIN_STATUS(adminId), {
    isActive,
  });
  return response.data;
};
export const deletePlatformAdminAPI = async (adminId) => {
  const response = await api.delete(APIROUTES.DELETE_PLATFORM_ADMIN(adminId));
  return response.data;
};

export const getPermissionsAPI = async () => {
  const response = await api.get(APIROUTES.GET_PERMISSIONS);
  return response.data;
};

export const addPlatformAdminAPI = async (data) => {
  const response = await api.post(APIROUTES.ADD_PLATFORM_ADMIN, data);
  return response.data;
};

export const getUserFeaturesAPI = async (adminId) => {
  const response = await api.get(APIROUTES.GET_USER_FEATURE(adminId));
  return response.data;
};

export const updateUserFeaturesAPI = async ({ adminId, data }) => {
  const response = await api.patch(
    APIROUTES.UPDATE_USER_FEATURE(adminId),
    data,
  );
  return response.data;
};
