import React, { useState } from "react";
import {
  RightSection,
  ProfileSection,
  SectionTitle,
  ProfileList,
  ProfileItem,
  ProfileItemLeft,
  ProfileItemTitle,
  ProfileItemSubtitle,
  ProfileItemRight,
  ActionButtons,
  CancelButton,
  SaveButton,
} from "../../../styles/CustomerPortal/Account.styled";
import { useTranslation } from "react-i18next";
import { updateUsername } from "../../../api/CustomerPortal/AccountApi";
import Toast from "../../../utility/CustomerPortal/Toast";

const UserProfile = ({
  profileData,
  onCancel,
  onSave,
  onChangePasswordClick,
}) => {
  const [userName, setUserName] = useState(profileData.userName);
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useTranslation();

  const isDirty = userName.trim() !== profileData.userName.trim();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUsername(profileData.userEmail, userName.trim());
      Toast.success("Username updated successfully.");
      onSave({ ...profileData, userName: userName.trim() });
    } catch (error) {
      Toast.error(
        error?.response?.data?.message ||
          t("login.errors.unexpectedError") ||
          "Failed to update username."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setUserName(profileData.userName);
    onCancel();
  };

  return (
    <RightSection>
      <ProfileSection>
        <SectionTitle>{t("txt_user_profile")}</SectionTitle>
        <ProfileList>
          <ProfileItem>
            <ProfileItemLeft>
              <ProfileItemTitle>{t("txt_user_name")}</ProfileItemTitle>
            </ProfileItemLeft>
            <ProfileItemRight>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                style={{
                  border: "none",
                  borderBottom: "1px solid #ccc",
                  outline: "none",
                  background: "transparent",
                  fontSize: "inherit",
                  color: "inherit",
                  width: "100%",
                  textAlign: "right",
                  padding: "2px 0",
                }}
              />
            </ProfileItemRight>
          </ProfileItem>

          <ProfileItem>
            <ProfileItemLeft>
              <ProfileItemTitle>{t("txt_user_email")}</ProfileItemTitle>
              <ProfileItemSubtitle>{t("txt_email_desc")}</ProfileItemSubtitle>
            </ProfileItemLeft>
            <ProfileItemRight>{profileData.userEmail}</ProfileItemRight>
          </ProfileItem>

          <ProfileItem onClick={onChangePasswordClick}>
            <ProfileItemLeft>
              <ProfileItemTitle>{t("txt_change_password")}</ProfileItemTitle>
            </ProfileItemLeft>
            <ProfileItemRight>
              <span className="arrow">›</span>
            </ProfileItemRight>
          </ProfileItem>
        </ProfileList>
      </ProfileSection>

      <ActionButtons>
        <CancelButton onClick={handleCancel}>{t("txt_cancel")}</CancelButton>
        <SaveButton disabled={!isDirty || isSaving} onClick={handleSave}>
          {isSaving ? t("txt_saving") || "Saving..." : t("txt_save_changes")}
        </SaveButton>
      </ActionButtons>
    </RightSection>
  );
};

export default UserProfile;
