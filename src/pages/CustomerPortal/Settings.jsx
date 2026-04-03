import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "../../Layout/CustomerPortal/DashboardLayout";
import Switch from "react-ios-switch";
import { useUser } from "../../context/CustomerPortal/UserContext";
import {
  getUserSettings,
  updateMovementSound,
  updateMovementVibration,
  updateAutoLogout,
  updateSound,
} from "../../api/CustomerPortal/SettingsApi";
import {
  SettingsContainer,
  SettingsHeader,
  PageTitle,
  LanguageSection,
  LanguageIcon,
  LanguageSelect,
  SettingsCard,
  SettingsSection,
  SectionTitle,
  SettingItem,
  SettingLabel,
  AutoLogoutDescription,
  RadioGroup,
  RadioOption,
  RadioInput,
  RadioLabel,
} from "../../styles/CustomerPortal/Settings.styled";
import LanguageImg from "../../assets/CustomerPortal/images/language.png";
import i18n from "../../i18n/CustomerPortal/config";
import { useTranslation } from "react-i18next";

const Settings = () => {
  const { user } = useUser();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [language, setLanguage] = useState(i18n.language || "en");
  const [notifications, setNotifications] = useState({
    urgentBeaconMovementSound: true,
    defaultTone: true,
    fireAlarm: false,
    emergencyAlarm: false,
    urgentBeaconMovementVibration: true,
  });
  const [autoLogout, setAutoLogout] = useState(true);
  const [logoutTime, setLogoutTime] = useState("5");

  // Fetch user settings
  const { data: userSettingsData } = useQuery({
    queryKey: ["userSettings", user?.email],
    queryFn: () => getUserSettings(user?.email),
    enabled: !!user?.email,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Update state when API data is loaded
  useEffect(() => {
    if (userSettingsData?.data) {
      const settings = userSettingsData.data;

      // Update auto logout settings
      setAutoLogout(settings.autoLogout === "1");
      if (settings.autoLogoutInterval) {
        setLogoutTime(settings.autoLogoutInterval);
      }

      // Update notification settings
      setNotifications((prev) => ({
        ...prev,
        urgentBeaconMovementSound:
          settings.movementSound === "1" || settings.movementSound === null,
        defaultTone: settings.sound === "DEFAULT" || settings.sound === null,
        fireAlarm: settings.sound === "FIRE",
        emergencyAlarm: settings.sound === "EMERGENCY",
        urgentBeaconMovementVibration:
          settings.movementVibration === "1" ||
          settings.movementVibration === true ||
          settings.movementVibration === null,
      }));
    }
  }, [userSettingsData]);

  const handleNotificationToggle = async (key) => {
    const newValue = !notifications[key];
    setNotifications({ ...notifications, [key]: newValue });

    const queryKey = ["userSettings", user?.email];
    await queryClient.cancelQueries({ queryKey });
    const previousData = queryClient.getQueryData(queryKey);

    try {
      if (key === "urgentBeaconMovementSound") {
        queryClient.setQueryData(queryKey, (old) => ({
          ...old,
          data: { ...old?.data, movementSound: newValue ? "1" : "0" },
        }));
        await updateMovementSound(user?.email, newValue ? "1" : "0");
      } else if (key === "urgentBeaconMovementVibration") {
        queryClient.setQueryData(queryKey, (old) => ({
          ...old,
          data: { ...old?.data, movementVibration: newValue ? "1" : "0" },
        }));
        await updateMovementVibration(user?.email, newValue ? "1" : "0");
      }
    } catch (error) {
      // Roll back on failure
      setNotifications((prev) => ({ ...prev, [key]: !newValue }));
      queryClient.setQueryData(queryKey, previousData);
      console.error(`Failed to update ${key}:`, error);
    }
  };

  // Tone key → API value mapping
  const toneValueMap = {
    defaultTone: "DEFAULT",
    fireAlarm: "FIRE",
    emergencyAlarm: "EMERGENCY",
  };

  const handleToneToggle = async (key) => {
    // If already on, do nothing (at least one must be active)
    if (notifications[key]) return;

    const newNotifications = {
      ...notifications,
      defaultTone: false,
      fireAlarm: false,
      emergencyAlarm: false,
      [key]: true,
    };
    setNotifications(newNotifications);

    const queryKey = ["userSettings", user?.email];
    await queryClient.cancelQueries({ queryKey });
    const previousData = queryClient.getQueryData(queryKey);
    const apiValue = toneValueMap[key];

    queryClient.setQueryData(queryKey, (old) => ({
      ...old,
      data: { ...old?.data, sound: apiValue },
    }));

    try {
      await updateSound(user?.email, apiValue);
    } catch (error) {
      setNotifications(notifications);
      queryClient.setQueryData(queryKey, previousData);
      console.error("Failed to update sound:", error);
    }
  };

  const handleAutoLogoutToggle = async () => {
    const newValue = !autoLogout;
    setAutoLogout(newValue);

    const queryKey = ["userSettings", user?.email];
    await queryClient.cancelQueries({ queryKey });
    const previousData = queryClient.getQueryData(queryKey);

    queryClient.setQueryData(queryKey, (old) => ({
      ...old,
      data: { ...old?.data, autoLogout: newValue ? "1" : "0" },
    }));

    try {
      await updateAutoLogout(user?.email, newValue ? "1" : "0");
    } catch (error) {
      setAutoLogout(!newValue);
      queryClient.setQueryData(queryKey, previousData);
      console.error("Failed to update auto logout:", error);
    }
  };

  const handleLogoutTimeChange = async (value) => {
    setLogoutTime(value);

    const queryKey = ["userSettings", user?.email];
    await queryClient.cancelQueries({ queryKey });
    const previousData = queryClient.getQueryData(queryKey);

    queryClient.setQueryData(queryKey, (old) => ({
      ...old,
      data: { ...old?.data, autoLogoutInterval: value },
    }));

    try {
      await updateAutoLogout(user?.email, autoLogout ? "1" : "0", value);
    } catch (error) {
      setLogoutTime(logoutTime);
      queryClient.setQueryData(queryKey, previousData);
      console.error("Failed to update logout interval:", error);
    }
  };

  return (
    <DashboardLayout>
      <SettingsContainer>
        <SettingsHeader>
          <PageTitle>{t("devices_Settings")}</PageTitle>
          {/* <LanguageSection>
            <LanguageIcon>
              <img src={LanguageImg} alt="Language" />
              {t("txt_Language")}:
            </LanguageIcon>
            <LanguageSelect
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                i18n.changeLanguage(e.target.value);
              }}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
            </LanguageSelect>
          </LanguageSection> */}
        </SettingsHeader>

        <SettingsCard>
          {/* Notifications: Sound */}
          <SettingsSection>
            <SectionTitle>
              {t("txt_notification")}: ({t("txt_sound")})
            </SectionTitle>
            <SettingItem>
              <SettingLabel>{t("txt_urgent")}</SettingLabel>
              <Switch
                checked={notifications.urgentBeaconMovementSound}
                onChange={() =>
                  handleNotificationToggle("urgentBeaconMovementSound")
                }
                onColor="rgb(76, 217, 100)"
              />
            </SettingItem>
          </SettingsSection>

          {/* Notifications: Tone */}
          <SettingsSection>
            <SectionTitle>
              {t("txt_notification")}: ({t("txt_tone")})
            </SectionTitle>
            <SettingItem>
              <SettingLabel>{t("txt_default")}</SettingLabel>
              <Switch
                checked={notifications.defaultTone}
                onChange={() => handleToneToggle("defaultTone")}
                onColor="rgb(76, 217, 100)"
              />
            </SettingItem>
            <SettingItem>
              <SettingLabel>{t("txt_alarm")}</SettingLabel>
              <Switch
                checked={notifications.fireAlarm}
                onChange={() => handleToneToggle("fireAlarm")}
                onColor="rgb(76, 217, 100)"
              />
            </SettingItem>
            <SettingItem>
              <SettingLabel>{t("txt_emergency")}</SettingLabel>
              <Switch
                checked={notifications.emergencyAlarm}
                onChange={() => handleToneToggle("emergencyAlarm")}
                onColor="rgb(76, 217, 100)"
              />
            </SettingItem>
          </SettingsSection>

          {/* Notifications: Vibration */}
          <SettingsSection>
            <SectionTitle>
              {t("txt_notification")}: ({t("txt_vibration")})
            </SectionTitle>
            <SettingItem>
              <SettingLabel>{t("txt_urgent")}</SettingLabel>
              <Switch
                checked={notifications.urgentBeaconMovementVibration}
                onChange={() =>
                  handleNotificationToggle("urgentBeaconMovementVibration")
                }
                onColor="rgb(76, 217, 100)"
              />
            </SettingItem>
          </SettingsSection>

          {/* Auto Logout */}
          <SettingsSection>
            <SettingItem>
              <SettingLabel>{t("txt_auto_logout")}</SettingLabel>
              <Switch
                checked={autoLogout}
                onChange={handleAutoLogoutToggle}
                onColor="rgb(76, 217, 100)"
              />
            </SettingItem>
            <AutoLogoutDescription>
              {t("txt_logout_description")}
            </AutoLogoutDescription>
            {autoLogout && (
              <RadioGroup>
                <RadioOption>
                  <RadioInput
                    type="radio"
                    name="logoutTime"
                    value="5"
                    checked={logoutTime === "5"}
                    onChange={(e) => handleLogoutTimeChange(e.target.value)}
                  />
                  <RadioLabel>5 {t("txt_mins")}</RadioLabel>
                </RadioOption>
                <RadioOption>
                  <RadioInput
                    type="radio"
                    name="logoutTime"
                    value="10"
                    checked={logoutTime === "10"}
                    onChange={(e) => handleLogoutTimeChange(e.target.value)}
                  />
                  <RadioLabel>10 {t("txt_mins")}</RadioLabel>
                </RadioOption>
                <RadioOption>
                  <RadioInput
                    type="radio"
                    name="logoutTime"
                    value="15"
                    checked={logoutTime === "15"}
                    onChange={(e) => handleLogoutTimeChange(e.target.value)}
                  />
                  <RadioLabel>15 {t("txt_mins")}</RadioLabel>
                </RadioOption>
              </RadioGroup>
            )}
          </SettingsSection>
        </SettingsCard>
      </SettingsContainer>
    </DashboardLayout>
  );
};

export default Settings;
