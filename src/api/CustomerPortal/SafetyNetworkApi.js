import api from "../../common/CustomerPortal/ConfigAxios";
import { APIROUTES } from "../../common/CustomerPortal/ApiRoutes";

export const getSafetyNetworkMembers = async (email) => {
  const response = await api.get(APIROUTES.GET_SAFETY_NETWORK_MEMBERS(email));
  return response.data;
};

export const getSafetyNetworkMemberDetails = async (email, memberEmail) => {
  const response = await api.get(
    APIROUTES.GET_SAFETY_NETWORK_MEMBER_DETAILS(email, memberEmail),
  );
  return response.data;
};

export const pingMemberLocations = async (email) => {
  const response = await api.post(APIROUTES.PING_MEMBER, { email });
  return response.data;
};

export const getMemberLocations = async (email) => {
  const response = await api.get(APIROUTES.GET_MEMBER_LOCATIONS(email));
  return response.data;
};

export const linkFamilyNetwork = async ({
  email,
  linkedMember,
  recipientName,
}) => {
  const response = await api.post(APIROUTES.LINK_FAMILY_NETWORK, {
    email,
    linkedMember,
    senderName: "",
    recipientName,
    enableLocation: false,
    enableSafety: false,
    enableSecurity: false,
  });
  return response.data;
};

export const verifyOTP = async ({ code, contactName, acceptorEmail }) => {
  const response = await api.post(APIROUTES.VERIFY_OTP, {
    code,
    contactName,
    acceptorEmail,
  });
  return response.data;
};

export const deleteMember = async ({ email, linkedMember }) => {
  const response = await api.post(APIROUTES.DELETE_MEMBER, {
    email,
    linkedMember,
  });
  return response.data;
};

export const resendInvitation = async ({
  email,
  linkedMember,
  recipientName,
}) => {
  const response = await api.post(APIROUTES.RESEND_INVITATION, {
    email,
    linkedMember,
    senderName: "",
    recipientName,
  });
  return response.data;
};

export const inviteSafetyMember = async (email) => {
  const response = await api.post(APIROUTES.INVITE_SAFETY_MEMBER, { email });
  return response.data;
};

export const updateMember = async ({
  email,
  linkedMember,
  recipientName,
  enableLocation,
  enableSafety,
  enableSecurity,
  senderName,
}) => {
  const response = await api.post(APIROUTES.UPDATE_MEMBER, {
    email,
    linkedMember,
    senderName,
    recipientName,
    enableLocation,
    enableSafety,
    enableSecurity,
  });
  return response.data;
};

// userStatus enum: Pending=0, Accepted=1, Rejected=2, Block=3, Unlink=4, Snooze=5, Delete=6
export const changeStatus = async ({ email, linkedMember, userStatus }) => {
  const response = await api.post(APIROUTES.CHANGE_STATUS, {
    email,
    linkedMember,
    userStatus,
    snoozeStartTime: "",
    snoozeEndTime: "",
  });
  return response.data;
};

export const sendTestAlert = async ({ email, linkedMember, userId }) => {
  const response = await api.post(APIROUTES.SEND_NOTIFICATION, {
    email,
    linkedMember,
    eventId: randomHexUUID(),
    userId: userId || "",
    roleId: "3",
    eventName: "MemberTestAlert",
  });
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
