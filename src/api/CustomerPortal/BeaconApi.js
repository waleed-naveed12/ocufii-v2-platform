import api from "../../common/CustomerPortal/ConfigAxios";
import { APIROUTES } from "../../common/CustomerPortal/ApiRoutes";
import Toast from "../../utility/CustomerPortal/Toast";
import i18n from "../../i18n/CustomerPortal/config";

export const setSnooze = async (
  email,
  beaconMAC,
  hours,
  minutes,
  gatewayMAC = "",
) => {
  try {
    const response = await api.post(APIROUTES.SET_SNOOZE, {
      email,
      beaconMAC,
      hours,
      minutes,
      gatewayMAC,
    });
    console.log("Set snooze response:", response.data);
    if (response.data.status == 200) {
      Toast.success(response.data.message || i18n.t("toast_snooze_started"));
      return response.data;
    } else {
      Toast.error(response.data.message || i18n.t("toast_snooze_start_failed"));
      return null;
    }
  } catch (error) {
    console.error("Error setting snooze:", error);
    Toast.error(i18n.t("toast_snooze_start_failed"));
    throw error;
  }
};

export const stopSnooze = async (email, beaconMAC) => {
  try {
    const response = await api.post(APIROUTES.STOP_SNOOZE, {
      email,
      beaconMAC,
    });
    console.log("Stop snooze response:", response.data);
    if (response.data.status == 200) {
      Toast.success(response.data.message || i18n.t("toast_snooze_cancelled"));
      return response.data;
    } else {
      Toast.error(
        response.data.message || i18n.t("toast_snooze_cancel_failed"),
      );
      return null;
    }
  } catch (error) {
    console.error("Error stopping snooze:", error);
    Toast.error(i18n.t("toast_snooze_cancel_failed"));
    throw error;
  }
};
