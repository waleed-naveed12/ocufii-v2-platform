import api from "../../common/CustomerPortal/ConfigAxios";
import axios from "axios";
import { APIROUTES } from "../../common/CustomerPortal/ApiRoutes";
import Toast from "../../utility/CustomerPortal/Toast";
import i18n from "../../i18n/CustomerPortal/config";
import { dateRangeMap } from "../../common/CustomerPortal/CommonData";

// Temporary: GET_ACTIVE_ALERTS runs against demo while backend is on localhost
const demoApi = axios.create({
  baseURL: "https://demo.ocufii.com/api/api",
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
demoApi.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("ocufii_customer_auth_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getDashboard = async (email, limit = 1000, dateRange = "all") => {
  try {
    dateRange = dateRangeMap[dateRange];
    // console.log("Fetching dashboard with dateRange:", dateRange);
    const response = await demoApi.get(
      APIROUTES.GET_ACTIVE_ALERTS(email, limit, dateRange),
    );
    // console.log("return response", response.data);
    if (response.data.status == 200) {
      // Ensure all alerts have proper numeric lat/lng for the map
      if (response.data.data) {
        const categories = ["safety", "security", "system"];
        categories.forEach((category) => {
          if (response.data.data[category]?.alerts) {
            response.data.data[category].alerts = response.data.data[
              category
            ].alerts.map((alert) => ({
              ...alert,
              // Ensure numeric latitude and longitude are present
              latitude: alert.latitude || parseFloat(alert.lat),
              longitude: alert.longitude || parseFloat(alert.lng),
            }));
          }
        });
      }
      return response.data;
    } else {
      Toast.error(
        response.data.message || i18n.t("toast_dashboard_fetch_failed"),
      );
      return null;
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};

export const pingRecipients = async (email, notificationId, senderEmail) => {
  try {
    const response = await api.post(APIROUTES.PING_RECIPIENTS, {
      email,
      notificationId,
      senderEmail,
    });
    console.log("Ping recipients response:", response.data);
    if (response.data.status == 200) {
      return response.data;
    } else {
      // Toast.error(response.data.message || "Failed to ping recipients");
      return null;
    }
  } catch (error) {
    console.error("Error ping recipients:", error);
    // Toast.error("Failed to ping recipients");
    throw error;
  }
};

export const getSafetyNetworkLocations = async (
  email,
  notificationId,
  senderEmail,
) => {
  try {
    const response = await api.get(
      APIROUTES.GET_SAFETY_NETWORK_LOCATIONS(
        email,
        notificationId,
        senderEmail,
      ),
    );
    console.log("Safety network locations response:", response.data);
    if (response.data.status == 200) {
      // Ensure all members have proper numeric lat/lng for the map
      if (response.data.members) {
        response.data.members = response.data.members.map((member) => ({
          ...member,
          // Map lat/long to latitude/longitude for consistency
          latitude: member.lat ? parseFloat(member.lat) : null,
          longitude: member.long ? parseFloat(member.long) : null,
        }));
      }
      return response.data;
    } else {
      // Toast.error(
      //   response.data.message || "Failed to get safety network locations"
      // );
      return null;
    }
  } catch (error) {
    console.error("Error getting safety network locations:", error);
    // Toast.error("Failed to get safety network locations");
    throw error;
  }
};

export const sendAssistMessage = async ({
  email,
  helperEmail,
  notificationId,
  lat,
  long,
  customMessage,
  title,
  eventName,
}) => {
  try {
    const response = await api.post(APIROUTES.SEND_ASSIST_MESSAGE, {
      email,
      helperEmail,
      notificationId,
      lat,
      long,
      customMessage,
      title,
      eventName,
    });
    console.log("Send assist message response:", response.data);
    if (response.data.status == 200) {
      // Toast.success(response.data.message || "Message sent successfully");
      return response.data;
    } else {
      // Toast.error(response.data.message || "Failed to send message");
      return null;
    }
  } catch (error) {
    console.error("Error sending assist message:", error);
    // Toast.error("Failed to send message");
    throw error;
  }
};

export const getAssistRequestStatus = async (notificationId) => {
  try {
    const response = await api.get(
      APIROUTES.GET_ASSIST_REQUEST_STATUS(notificationId),
    );
    console.log("Get assist request status response:", response.data);
    if (response.data.status == 200) {
      return response.data;
    } else {
      // Toast.error(
      //   response.data.message || "Failed to get assist request status"
      // );
      return null;
    }
  } catch (error) {
    console.error("Error getting assist request status:", error);
    // Toast.error("Failed to get assist request status");
    throw error;
  }
};

export const shareRoute = async ({
  notificationId,
  eventId,
  senderEmail,
  receiverEmail,
  destinationLat,
  destinationLng,
  helperLat,
  helperLng,
}) => {
  try {
    const response = await api.post(APIROUTES.SHARE_ROUTE, {
      notificationId,
      eventId,
      senderEmail,
      receiverEmail,
      destinationLat,
      destinationLng,
      helperLat,
      helperLng,
    });
    console.log("Share route response:", response.data);
    if (response.data.status == 200) {
      Toast.success(i18n.t("toast_route_shared"));
      return response.data;
    } else {
      Toast.error(i18n.t("toast_route_share_failed"));
      return null;
    }
  } catch (error) {
    console.error("Error sharing route:", error);
    Toast.error(i18n.t("toast_route_share_failed"));
    throw error;
  }
};

export const getAlertSummary = async (email, startDateTime, endDateTime) => {
  try {
    const response = await api.post(APIROUTES.GET_ALERT_SUMMARY, {
      email,
      startDateTime,
      endDateTime,
    });
    // console.log("Get alert summary response:", response.data);
    if (response.data.status == 200) {
      return response.data;
    } else {
      Toast.error(
        response.data.message || i18n.t("toast_alert_summary_failed"),
      );
      return null;
    }
  } catch (error) {
    console.error("Error getting alert summary:", error);
    Toast.error(i18n.t("toast_alert_summary_failed"));
    throw error;
  }
};

export const getDeviceHealth = async (email) => {
  try {
    const response = await api.get(APIROUTES.GET_DEVICE_HEALTH(email));
    // console.log("Get device health response:", response.data);
    if (response.data.status == 200) {
      return response.data;
    } else {
      Toast.error(
        response.data.message || i18n.t("toast_device_health_failed"),
      );
      return null;
    }
  } catch (error) {
    console.error("Error getting device health:", error);
    Toast.error(i18n.t("toast_device_health_failed"));
    throw error;
  }
};

export const getAlertNotes = async (email, notificationId) => {
  try {
    const response = await api.get(
      APIROUTES.GET_ALERT_NOTES(email, notificationId),
    );
    console.log("Get alert notes response:", response.data);
    if (response.data.status == 200) {
      return response.data;
    } else {
      Toast.error(response.data.message || i18n.t("toast_alert_notes_failed"));
      return null;
    }
  } catch (error) {
    console.error("Error getting alert notes:", error);
    Toast.error(i18n.t("toast_alert_notes_failed"));
    throw error;
  }
};

export const addAlertNote = async ({
  notificationId,
  email,
  authorName,
  noteText,
  newStatus,
}) => {
  try {
    const response = await api.post(APIROUTES.ADD_ALERT_NOTES, {
      notificationId,
      email,
      authorName,
      noteText,
      newStatus,
    });
    console.log("Add alert note response:", response.data);
    if (response.data.status == 200) {
      Toast.success(response.data.message || i18n.t("toast_note_added"));
      return response.data;
    } else {
      Toast.error(response.data.message || i18n.t("toast_note_add_failed"));
      return null;
    }
  } catch (error) {
    console.error("Error adding alert note:", error);
    Toast.error(i18n.t("toast_note_add_failed"));
    throw error;
  }
};

export const getOverviewStats = async (email) => {
  try {
    const response = await api.get(APIROUTES.GET_OVERVIEW_STATS(email));
    console.log("Get overview stats response:", response.data);
    if (response.data.status == 200) {
      return response.data;
    } else {
      Toast.error(
        response.data.message || i18n.t("toast_overview_stats_failed"),
      );
      return null;
    }
  } catch (error) {
    console.error("Error getting overview stats:", error);
    Toast.error(i18n.t("toast_overview_stats_failed"));
    throw error;
  }
};

export const sendMessageToVictim = async (email, notificationId) => {
  try {
    const response = await api.post(APIROUTES.SEND_MESSAGE_TO_VICTIM, {
      email,
      notificationId,
    });
    console.log(
      "Send message to victim response:",
      response.status,
      response.data,
    );
    // Check HTTP status code directly since API returns 200 with no response body
    if (response.status === 200) {
      Toast.success(i18n.t("toast_message_sent"));
      return response.data;
    } else {
      Toast.error(i18n.t("toast_message_send_failed"));
      return null;
    }
  } catch (error) {
    console.error("Error sending message to victim:", error);
    Toast.error(i18n.t("toast_message_send_failed"));
    throw error;
  }
};
