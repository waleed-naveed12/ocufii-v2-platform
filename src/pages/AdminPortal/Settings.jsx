import React from "react";
import { useNavigate } from "react-router-dom";
import { DashboardContent } from "../../styles/AdminPortal/Dashboard.styled";
import {
  SettingsContainer,
  SettingsHeader,
  SettingsList,
  SettingsItem,
  SettingsItemLeft,
  SettingsIcon,
  SettingsItemContent,
  SettingsItemRight,
} from "../../styles/AdminPortal/Settings.styled";
import { AiOutlineLock, AiOutlineRight } from "react-icons/ai";
import { MdOutlineNoAccounts } from "react-icons/md";
import { ROUTE } from "../../common/AdminPortal/Routes";

const Settings = () => {
  const navigate = useNavigate();

  const settingsOptions = [
    {
      id: 1,
      title: "Change Password",
      description: "Update your password to keep your account secure",
      icon: <AiOutlineLock />,
      iconBg: "#fef3c7",
      iconColor: "#ed8b00",
      route: ROUTE.PASSWORD,
    },
    // {
    //   id: 2,
    //   title: "Deactivate Account",
    //   description: "Permanently deactivate your account",
    //   icon: <MdOutlineNoAccounts />,
    //   iconBg: "#fef3c7",
    //   iconColor: "#ed8b00",
    //   route: ROUTE.PASSWORD,
    // },
  ];

  const handleOptionClick = (route) => {
    if (route) {
      navigate(route);
    }
  };

  return (
    <DashboardContent>
      <SettingsContainer>
        <SettingsHeader>
          <h1>Settings</h1>
          <p>Manage your account settings and preferences</p>
        </SettingsHeader>

        <SettingsList>
          {settingsOptions.map((option) => (
            <SettingsItem
              key={option.id}
              onClick={() => handleOptionClick(option.route)}
            >
              <SettingsItemLeft>
                <SettingsIcon
                  color={option.iconBg}
                  iconColor={option.iconColor}
                >
                  {option.icon}
                </SettingsIcon>
                <SettingsItemContent>
                  <h3>{option.title}</h3>
                  <p>{option.description}</p>
                </SettingsItemContent>
              </SettingsItemLeft>
              <SettingsItemRight>
                <AiOutlineRight />
              </SettingsItemRight>
            </SettingsItem>
          ))}
        </SettingsList>
      </SettingsContainer>
    </DashboardContent>
  );
};

export default Settings;
