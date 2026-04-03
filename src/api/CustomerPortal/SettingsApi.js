import api from "../../common/CustomerPortal/ConfigAxios";
import { APIROUTES } from "../../common/CustomerPortal/ApiRoutes";

export const getUserSettings = async (email) => {
  const response = await api.get(APIROUTES.GET_USER_SETTINGS(email));
  return response.data;
};

export const updateEmergency911 = async (email, value) => {
  const response = await api.put(APIROUTES.UPDATE_SETTING_911, {
    email,
    value,
  });
  return response.data;
};

export const updateEmergency988 = async (email, value) => {
  const response = await api.put(APIROUTES.UPDATE_SETTING_988, {
    email,
    value,
  });
  return response.data;
};

export const updateEmergency = async (email, value) => {
  const response = await api.put(APIROUTES.UPDATE_SETTING_EMERGENCY, {
    email,
    value,
  });
  return response.data;
};

export const updateActiveShooter = async (email, value) => {
  const response = await api.put(APIROUTES.UPDATE_SETTING_ACTIVE_SHOOTER, {
    email,
    value,
  });
  return response.data;
};

export const updateDistress = async (email, value) => {
  const response = await api.put(APIROUTES.UPDATE_SETTING_DISTRESS, {
    email,
    value,
  });
  return response.data;
};

export const updatePolice = async (email, value) => {
  const response = await api.put(APIROUTES.UPDATE_SETTING_POLICE, {
    email,
    value,
  });
  return response.data;
};

export const updateMedicalService = async (email, value) => {
  const response = await api.put(APIROUTES.UPDATE_SETTING_MEDICAL, {
    email,
    value,
  });
  return response.data;
};

export const updateFireDepartment = async (email, value) => {
  const response = await api.put(APIROUTES.UPDATE_SETTING_FIRE, {
    email,
    value,
  });
  return response.data;
};

export const updateMovementSound = async (email, value) => {
  const response = await api.put(APIROUTES.UPDATE_MOVEMENT_SOUND, {
    email,
    value,
  });
  return response.data;
};

export const updateMovementVibration = async (email, value) => {
  const response = await api.put(APIROUTES.UPDATE_MOVEMENT_VIBRATION, {
    email,
    value,
  });
  return response.data;
};

export const updateAutoLogout = async (
  email,
  autoLogout,
  autoLogoutInterval = "15",
) => {
  const response = await api.put(APIROUTES.UPDATE_AUTO_LOGOUT, {
    email,
    autoLogout,
    autoLogoutInterval,
  });
  return response.data;
};

export const updateSound = async (email, value) => {
  const response = await api.put(APIROUTES.UPDATE_SOUND, { email, value });
  return response.data;
};

export const updatePersonalSafetyUsername = async (email, value) => {
  const response = await api.put(APIROUTES.UPDATE_PERSONAL_SAFETY_USERNAME, {
    email,
    value,
  });
  return response.data;
};
