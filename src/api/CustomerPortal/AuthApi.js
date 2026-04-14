import axios from "axios";
import api from "../../common/CustomerPortal/ConfigAxios";
import { APIROUTES } from "../../common/CustomerPortal/ApiRoutes";

/**
 * Login API
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} roleId - User role ID (default: "3")
 * @returns {Promise} - Login response with user data and tokens
 */
export const loginAPI = async (email, password, roleId = "3") => {
  try {
    const response = await api.post(APIROUTES.LOGIN, {
      email,
      password,
      roleId,
    });
    return response.data;
  } catch (error) {
    console.error("Login API Error:", error);
    throw error;
  }
};

/**
 * Forgot Password API — sends a verification link to the user's email
 * @param {string} email
 */
export const forgotPasswordAPI = async (email) => {
  try {
    const response = await api.post(APIROUTES.FORGOT_PASSWORD_EMAIL, { email });
    return response.data;
  } catch (error) {
    console.error("Forgot Password API Error:", error);
    throw error;
  }
};

export const changePasswordEmailAPI = async (email) => {
  try {
    const response = await api.post(APIROUTES.CHANGE_PASSWORD_EMAIL, { email });
    return response.data;
  } catch (error) {
    console.error("Change Password Email API Error:", error);
    throw error;
  }
};

export const changePasswordDirectAPI = async ({
  email,
  oldPassword,
  newPassword,
}) => {
  try {
    const response = await api.post(APIROUTES.CHANGE_PASSWORD_DIRECT, {
      email,
      oldPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.error("Change Password Direct API Error:", error);
    throw error;
  }
};

export const resetPasswordAPI = async ({ email, newPassword }) => {
  try {
    const response = await api.post(APIROUTES.RESET_PASSWORD, {
      email,
      newPassword,
    });
    return response.data;
  } catch (error) {
    console.error("Reset Password API Error:", error);
    throw error;
  }
};

/**
 * Logout API (if needed in future)
 */
export const logoutAPI = async () => {
  // Implement logout API call if backend supports it
  return Promise.resolve();
};

export const getTOSItem = async () => {
  const response = await api.get(APIROUTES.GET_TOS_ITEM);
  return response.data;
};

export const acceptTOS = async (email) => {
  const response = await api.post(APIROUTES.ACCEPT_TOS, {
    email,
    accepted: true,
  });
  return response.data;
};

/**
 * Generates a short-lived service token for unauthenticated operations (e.g. signup).
 * Credentials are read from window config (public/config.js).
 */
export const generateSignUpToken = async () => {
  const response = await axios.post(
    `${window.CustomerPortalBaseAPIURL}${APIROUTES.GENERATE_TOKEN}`,
    {
      email: window.CustomerPortalAPIEmail,
      password: window.CustomerPortalAPIPassword,
      roleId: "3",
    }
  );
  return response.data;
};

/**
 * Sends a verification email for a new signup.
 * Uses a service token (not the user's session token) as Bearer.
 */
export const verifyEmailForSignUp = async (email, bearerToken) => {
  const response = await axios.post(
    `${window.CustomerPortalBaseAPIURL}${APIROUTES.VERIFY_EMAIL_SIGNUP}`,
    { email },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken}`,
      },
    }
  );
  return response.data;
};

/**
 * Fetches TOS content without a user session (sign-up flow).
 */
export const getTOSItemPublic = async (bearerToken) => {
  const response = await axios.get(
    `${window.CustomerPortalBaseAPIURL}${APIROUTES.GET_TOS_ITEM}`,
    { headers: { Authorization: `Bearer ${bearerToken}` } },
  );
  return response.data;
};

/**
 * Creates a new user account (web sign-up flow).
 * Uses a service token as Bearer since the user is not yet authenticated.
 */
export const webSignUpAPI = async (
  { email, fullName, password, isAdult, tosAccepted, gmtInfo },
  bearerToken,
) => {
  const response = await axios.post(
    `${window.CustomerPortalBaseAPIURL}${APIROUTES.WEBSIGNUP}`,
    { email, fullName, password, isAdult, tosAccepted, gmtInfo },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken}`,
      },
    },
  );
  return response.data;
};
