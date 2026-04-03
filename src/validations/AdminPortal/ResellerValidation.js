import * as yup from "yup";

export const resellerSchema = yup.object().shape({
  name: yup
    .string()
    .min(2, "Name must be at least 2 characters")
    .required("Name is required"),
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
  contactName: yup
    .string()
    .min(2, "Contact name must be at least 2 characters")
    .required("Contact name is required"),
  phoneNumber: yup
    .string()
    .matches(/^[0-9+\-() ]+$/, "Invalid phone number format")
    .min(10, "Phone number must be at least 10 digits")
    .required("Phone number is required"),
});
