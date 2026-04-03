import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { DashboardContent } from "../../styles/AdminPortal/Dashboard.styled";
import {
  PasswordFormContainer,
  PasswordFormHeader,
  PasswordFormBody,
  PasswordFormFooter,
} from "../../styles/AdminPortal/PasswordForm.styled";
import Input from "../../components/AdminPortal/Input";
import {
  PrimaryButton,
  SecondaryButton,
} from "../../components/AdminPortal/Button";
import { updatePasswordAPI } from "../../api/AdminPortal/AuthApi";
import { passwordChangeSchema } from "../../validations/AdminPortal/LoginValidations";
import Toast from "../../utility/AdminPortal/Toast";

const PasswordManagement = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  // Mutation for updating password
  const updatePasswordMutation = useMutation({
    mutationFn: updatePasswordAPI,
    onSuccess: () => {
      Toast.success("Password updated successfully");
      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
    },
    onError: (error) => {
      Toast.error(
        error?.response?.data?.message || "Failed to update password",
      );
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate form data
      await passwordChangeSchema.validate(formData, { abortEarly: false });

      // If validation passes, submit the form
      updatePasswordMutation.mutate({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
    } catch (validationErrors) {
      // Handle validation errors
      const errorObj = {};
      validationErrors.inner.forEach((error) => {
        errorObj[error.path] = error.message;
      });
      setErrors(errorObj);
    }
  };

  const handleReset = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
  };

  return (
    <DashboardContent>
      <PasswordFormContainer>
        <PasswordFormHeader>
          <h2>Change Password</h2>
          <p>Update your password to keep your account secure</p>
        </PasswordFormHeader>

        <form onSubmit={handleSubmit}>
          <PasswordFormBody>
            <Input
              label="Current Password"
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleInputChange}
              placeholder="Enter your current password"
              error={errors.currentPassword}
            />
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="Enter your new password"
              error={errors.newPassword}
            />
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your new password"
              error={errors.confirmPassword}
            />
          </PasswordFormBody>

          <PasswordFormFooter>
            <SecondaryButton
              type="button"
              onClick={handleReset}
              disabled={updatePasswordMutation.isPending}
            >
              Reset
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              isLoading={updatePasswordMutation.isPending}
              disabled={updatePasswordMutation.isPending}
            >
              Update Password
            </PrimaryButton>
          </PasswordFormFooter>
        </form>
      </PasswordFormContainer>
    </DashboardContent>
  );
};

export default PasswordManagement;
