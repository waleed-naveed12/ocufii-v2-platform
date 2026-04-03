import api from "../../common/AdminPortal/ConfigAxios";
import { APIROUTES } from "../../common/AdminPortal/ApiRoutes";

export const loginAPI = async (email, password) => {
  try {
    const response = await api.post(APIROUTES.Login, {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    // Re-throw the error to be handled by the caller
    throw error;
  }
};

export const updatePasswordAPI = async ({ currentPassword, newPassword }) => {
  const response = await api.patch(APIROUTES.UPDATE_PASSWORD, {
    currentPassword,
    newPassword,
  });
  return response.data;
};
