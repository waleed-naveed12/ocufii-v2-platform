import api from "../../common/CustomerPortal/ConfigAxios";
import { APIROUTES } from "../../common/CustomerPortal/ApiRoutes";
import Toast from "../../utility/CustomerPortal/Toast";
import i18n from "../../i18n/CustomerPortal/config";

export const getAllDevices = async (email) => {
  try {
    const response = await api.get(APIROUTES.GET_ALL_DEVICES(email));
    return response.data;
  } catch (error) {
    console.error("Error fetching devices:", error);
    Toast.error(i18n.t("txt_failed_to_fetchs"));
    throw error;
  }
};

export const updateBeaconAPI = async ({
  email,
  beaconMAC,
  beaconName,
  beaconLocation,
  comments,
}) => {
  try {
    const response = await api.put(APIROUTES.UPDATE_BEACON, {
      email,
      beaconMAC,
      beaconName,
      beaconLocation,
      comments,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating beacon:", error);
    throw error;
  }
};

export const updateGatewayAPI = async ({
  email,
  gatewayMAC,
  deviceName,
  gatewayLocation,
  comments,
}) => {
  try {
    const response = await api.put(APIROUTES.UPDATE_GATEWAY, {
      email,
      gatewayMAC,
      deviceName,
      gatewayLocation,
      comments,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating gateway:", error);
    throw error;
  }
};

export const deleteGatewayEmailAPI = async (email) => {
  try {
    const response = await api.post(APIROUTES.DELETE_GATEWAY_EMAIL, { email });
    return response.data;
  } catch (error) {
    console.error("Error sending delete gateway email:", error);
    throw error;
  }
};

export const deleteGatewayDirectAPI = async ({ email, mac }) => {
  try {
    const response = await api.post(APIROUTES.DELETE_GATEWAY_DIRECT, {
      email,
      mac,
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting gateway:", error);
    throw error;
  }
};

export const deleteBeaconEmailAPI = async (email) => {
  try {
    const response = await api.post(APIROUTES.DELETE_BEACON_EMAIL, { email });
    return response.data;
  } catch (error) {
    console.error("Error sending delete beacon email:", error);
    throw error;
  }
};

export const deleteBeaconDirectAPI = async ({ email, mac }) => {
  try {
    const response = await api.post(APIROUTES.DELETE_BEACON_DIRECT, {
      email,
      mac,
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting beacon:", error);
    throw error;
  }
};
