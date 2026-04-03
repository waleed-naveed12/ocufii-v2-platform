import api from "../../common/CustomerPortal/ConfigAxios";
import { APIROUTES } from "../../common/CustomerPortal/ApiRoutes";

export const getRecipients = async (email) => {
  const response = await api.get(APIROUTES.GET_RECIPIENTS(email));
  return response.data;
};

export const sendAddRecipientEmail = async (email) => {
  const response = await api.post(APIROUTES.EMAIL_ADD_RECIPIENT, { email });
  return response.data;
};

export const addRecipient = async (data) => {
  const response = await api.post(APIROUTES.ADD_RECIPIENT, data);
  return response.data;
};

export const deleteRecipient = async ({ email, recipient }) => {
  const response = await api.delete(APIROUTES.DELETE_RECIPIENT, {
    data: { email, recipient, userNotifyType: "both" },
  });
  return response.data;
};

export const updateRecipient = async (data) => {
  const response = await api.post(APIROUTES.UPDATE_RECIPIENT, data);
  return response.data;
};

function randomHexUUID() {
  const hex = "0123456789abcdef";
  const r = (n) =>
    Array.from({ length: n }, () => hex[Math.floor(Math.random() * 16)]).join(
      "",
    );
  return `${r(8)}-${r(4)}-${r(4)}-${r(4)}-${r(12)}`;
}

export const sendRecipientTestAlert = async ({ email, recipient, userId }) => {
  const response = await api.post(APIROUTES.SEND_RECIPIENT_NOTIFICATION, {
    email,
    recipient,
    eventId: randomHexUUID(),
    userId: userId || "",
    roleId: "3",
    eventName: "TestAlert",
  });
  return response.data;
};

export const pollEmailVerification = async (email, category) => {
  const response = await api.get(
    APIROUTES.VERIFICATION_POLLING(email, category),
  );
  return response.data;
};
