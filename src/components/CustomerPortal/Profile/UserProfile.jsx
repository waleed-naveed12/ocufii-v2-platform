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

const UserProfile = ({
  profileData,
  onCancel,
  onSave,
  onChangePasswordClick,
}) => {
  const [editingField, setEditingField] = useState(null);
  const [localProfileData, setLocalProfileData] = useState(profileData);
  const { t } = useTranslation();

  const handleInputChange = (fieldName, value) => {
    setLocalProfileData({
      ...localProfileData,
      [fieldName]: value,
    });
  };

  const handleInputBlur = () => {
    setEditingField(null);
  };

  const handleSave = () => {
    onSave(localProfileData);
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
            <ProfileItemRight>{localProfileData.userName}</ProfileItemRight>
          </ProfileItem>

          <ProfileItem>
            <ProfileItemLeft>
              <ProfileItemTitle>{t("txt_user_email")}</ProfileItemTitle>
              <ProfileItemSubtitle>{t("txt_email_desc")}</ProfileItemSubtitle>
            </ProfileItemLeft>
            <ProfileItemRight>{localProfileData.userEmail}</ProfileItemRight>
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
        <CancelButton onClick={onCancel}>{t("txt_cancel")}</CancelButton>
        <SaveButton disabled onClick={handleSave}>
          {t("txt_save_changes")}
        </SaveButton>
      </ActionButtons>
    </RightSection>
  );
};

export default UserProfile;
