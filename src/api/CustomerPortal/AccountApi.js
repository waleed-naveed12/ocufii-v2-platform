import api from "../../common/CustomerPortal/ConfigAxios";
import { APIROUTES } from "../../common/CustomerPortal/ApiRoutes";
import Toast from "../../utility/CustomerPortal/Toast";
import i18n from "../../i18n/CustomerPortal/config";

export const deleteUserAccount = async (email) => {
  try {
    const response = await api.post(APIROUTES.DELETE_ACCOUNT, {
      email,
    });

    if (response.status !== 200) {
      return false;
    } else {
      console.log("Account deleted successfully");
      Toast.success(i18n.t("toast_account_deleted"));
    }
    return true;
  } catch (error) {
    console.error("Delete Account API Error:", error);
    throw error;
  }
};

export const deleteNotifications = async (email) => {
  try {
    const response = await api.delete(APIROUTES.DELETE_NOTIFICATIONS(email));
    console.log("Delete Notifications Response:", response);
    if (response.status !== 204) {
      return false;
    } else {
      console.log("Notifications deleted successfully");
      Toast.success(i18n.t("toast_notifications_deleted"));
    }
    return true;
  } catch (error) {
    console.error("Delete Notifications API Error:", error);
    Toast.error(i18n.t("toast_notifications_failed"));
    throw error;
  }
};
