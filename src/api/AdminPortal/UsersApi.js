import api from "../../common/AdminPortal/ConfigAxios";
import { APIROUTES } from "../../common/AdminPortal/ApiRoutes";

/**
 * Get all users/tenants
 * @returns {Promise} - Promise with users data
 */
export const getUsersAPI = async () => {
  const response = await api.get(APIROUTES.GET_USERS);
  //   console.log("getUsersAPI response:", response);
  return response.data.data;
};
