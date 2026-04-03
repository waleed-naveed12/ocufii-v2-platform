import api from "../../common/AdminPortal/ConfigAxios";
import { APIROUTES } from "../../common/AdminPortal/ApiRoutes";

export const getSystemPermissionsAPI = async () => {
  const response = await api.get(APIROUTES.GET_SYSTEM_PERMISSIONS);
  return response.data;
};

export const updateSystemPermissionAPI = async ({ permissionId, data }) => {
  const response = await api.patch(
    APIROUTES.UPDATE_SYSTEM_PERMISSIONS(permissionId),
    data,
  );
  return response.data;
};
