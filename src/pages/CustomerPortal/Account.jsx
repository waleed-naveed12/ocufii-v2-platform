import React, { useState } from "react";
import DashboardLayout from "../../Layout/CustomerPortal/DashboardLayout";
import { useUser } from "../../context/CustomerPortal/UserContext";
import UserProfile from "../../components/CustomerPortal/Profile/UserProfile";
import ChangePassword from "../../components/CustomerPortal/Profile/ChangePassword";
import ChangePasswordEmailStep from "../../components/CustomerPortal/Profile/ChangePasswordEmailStep";
import ChangePasswordVerifiedStep from "../../components/CustomerPortal/Profile/ChangePasswordVerifiedStep";
import deleteIcon from "../../assets/CustomerPortal/images/delete.svg";
import {
  AccountContainer,
  PageTitle,
  BeaconDetailsLink,
  AccountCard,
  LeftSection,
  ProfileAvatarWrapper,
  ProfileAvatar,
  AvatarPlaceholder,
  UserName,
  DeleteAccountSection,
  DeleteAccountButton,
} from "../../styles/CustomerPortal/Account.styled";
import { deleteUserAccount, deleteNotifications } from "../../api/CustomerPortal/AccountApi";
import { useNavigate } from "react-router-dom";
import { ROUTE } from "../../common/CustomerPortal/Routes";
import { useTranslation } from "react-i18next";

const Account = () => {
  const { user } = useUser();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    userName: user?.firstName
      ? `${user.firstName} ${user.lastName || ""}`
      : "John Doe",
    userEmail: user?.email || "johndoe@example.com",
  });

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showPasswordEmailStep, setShowPasswordEmailStep] = useState(false);
  const [showPasswordVerifiedStep, setShowPasswordVerifiedStep] = useState(false);
  const [pendingPasswordData, setPendingPasswordData] = useState({ currentPassword: "", newPassword: "" });

  const handleSave = (updatedProfileData) => {
    console.log("Saving profile data:", updatedProfileData);
    setProfileData(updatedProfileData);
    // Add your save logic here
  };

  const handleCancel = () => {
    setShowChangePassword(false);
    setShowPasswordEmailStep(false);
    setShowPasswordVerifiedStep(false);
  };

  const handleChangePasswordClick = () => {
    setShowChangePassword(true);
  };

  const handlePasswordEmailSent = (passwordData) => {
    setPendingPasswordData(passwordData);
    setShowChangePassword(false);
    setShowPasswordEmailStep(true);
  };

  const handleDeleteAccount = async () => {
    const deleteConfirmed = await deleteUserAccount(profileData?.userEmail);
    if (deleteConfirmed) {
      navigate(ROUTE.LOGIN);
    }
  };

  const handleDeleteNotifications = async () => {
    try {
      await deleteNotifications(profileData?.userEmail);
    } catch (error) {
      console.error("Error deleting notifications:", error);
    }
  };

  return (
    <DashboardLayout>
      <AccountContainer>
        <PageTitle>{t("txt_profile")}</PageTitle>

        <AccountCard>
          {/* Left Section - Profile Avatar */}
          <LeftSection>
            <ProfileAvatarWrapper>
              <ProfileAvatar>
                <AvatarPlaceholder />
              </ProfileAvatar>
            </ProfileAvatarWrapper>
            <UserName>{profileData?.userName || "John Doe"}</UserName>

            <DeleteAccountSection>
              <DeleteAccountButton disabled onClick={handleDeleteAccount}>
                <img src={deleteIcon} alt="Delete" />
                {t("txt_delete_account")}
              </DeleteAccountButton>
              <DeleteAccountButton onClick={handleDeleteNotifications}>
                <img src={deleteIcon} alt="Delete" />
                {t("txt_delete_all_notifications")}
              </DeleteAccountButton>
            </DeleteAccountSection>
          </LeftSection>

          {/* Right Section - User Profile Settings */}
          {showPasswordEmailStep ? (
            <ChangePasswordEmailStep
              email={user?.email}
              onVerified={() => { setShowPasswordEmailStep(false); setShowPasswordVerifiedStep(true); }}
            />
          ) : showPasswordVerifiedStep ? (
            <ChangePasswordVerifiedStep
              email={user?.email}
              currentPassword={pendingPasswordData.currentPassword}
              newPassword={pendingPasswordData.newPassword}
              onComplete={handleCancel}
            />
          ) : showChangePassword ? (
            <ChangePassword
              onCancel={handleCancel}
              onEmailSent={handlePasswordEmailSent}
            />
          ) : (
            <UserProfile
              profileData={profileData}
              onCancel={handleCancel}
              onSave={handleSave}
              onChangePasswordClick={handleChangePasswordClick}
            />
          )}
        </AccountCard>
      </AccountContainer>
    </DashboardLayout>
  );
};

export default Account;
