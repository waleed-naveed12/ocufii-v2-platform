import React, { useState } from "react";
import Switch from "react-ios-switch";
import { MdChevronRight } from "react-icons/md";
import AlertButtonDetails from "./AlertButtonDetails";
import {
  AlertButtonsContainer,
  AlertButtonsTitle,
  AlertButtonsList,
  AlertButtonItem,
  AlertButtonLeft,
  AlertButtonLabel,
} from "../../../styles/CustomerPortal/PersonalSafety.styled";
import { useTranslation } from "react-i18next";

const AlertButtonsSettings = ({ alertSettings, onToggle, settingsData }) => {
  const [expandedButton, setExpandedButton] = useState(null);
  const { t } = useTranslation();

  // Map API keys to display labels and alert settings keys
  // hideFlashlight/hideAlarm: fields not applicable for this alert type
  const buttonConfig = {
    emergency911: {
      label: "txt_auto_911",
      key: "autoDial911",
      defaultMessage: "personalSafety_Alert_911",
      hideFlashlight: true,
      hideAlarm: true,
    },
    emergency988: {
      label: "txt_auto_988",
      key: "autoDial988",
      defaultMessage: "personalSafety_Alert_988",
      hideFlashlight: true,
      hideAlarm: true,
    },
    emergency: {
      label: "txt_emergency_txt",
      key: "emergency",
      defaultMessage: "personalSafety_Critical_Emergency",
      hideFlashlight: false,
      hideAlarm: false,
    },
    activeShooter: {
      label: "txt_active_shooter",
      key: "activeShooter",
      defaultMessage: " personalSafety_Active_Shooter",
      hideFlashlight: false,
      hideAlarm: false,
    },
    distress: {
      label: "txt_feeling_unsafe",
      key: "feelingUnsafe",
      defaultMessage: "personalSafety_Feeling_Unsafe",
      hideFlashlight: false,
      hideAlarm: false,
    },
  };

  // Build alert buttons from settingsData
  const alertButtons = Object.keys(buttonConfig).map((dataKey) => {
    try {
      // Handle null values by treating them as disabled
      if (
        settingsData?.[dataKey] === null ||
        settingsData?.[dataKey] === undefined
      ) {
        return {
          dataKey,
          key: buttonConfig[dataKey].key,
          label: buttonConfig[dataKey].label,
          alertMessage: buttonConfig[dataKey].defaultMessage,
          flashOn: false,
          alarmSound: false,
          isEnabled: false,
          hideFlashlight: buttonConfig[dataKey].hideFlashlight,
          hideAlarm: buttonConfig[dataKey].hideAlarm,
        };
      }

      const parsedData = JSON.parse(settingsData[dataKey]);
      return {
        dataKey,
        key: buttonConfig[dataKey].key,
        label: buttonConfig[dataKey].label,
        alertMessage:
          parsedData.alertMessage || buttonConfig[dataKey].defaultMessage,
        flashOn: parsedData.flashOn || false,
        alarmSound: parsedData.alarmSound || false,
        isEnabled: parsedData.isEnabled || false,
        hideFlashlight: buttonConfig[dataKey].hideFlashlight,
        hideAlarm: buttonConfig[dataKey].hideAlarm,
      };
    } catch (error) {
      console.error(`Error parsing ${dataKey}:`, error);
      return {
        dataKey,
        key: buttonConfig[dataKey].key,
        label: buttonConfig[dataKey].label,
        alertMessage: buttonConfig[dataKey].defaultMessage,
        flashOn: false,
        alarmSound: false,
        isEnabled: false,
        hideFlashlight: buttonConfig[dataKey].hideFlashlight,
        hideAlarm: buttonConfig[dataKey].hideAlarm,
      };
    }
  });

  const handleButtonClick = (key) => {
    setExpandedButton(expandedButton === key ? null : key);
  };

  const handleMessageChange = (key, value) => {
    console.log(`Update message for ${key}:`, value);
    // TODO: Implement API call to update message
  };

  const handleFlashlightToggle = (dataKey, button) => {
    onToggle(dataKey, { ...button, flashOn: !button.flashOn });
  };

  const handleAlarmToggle = (dataKey, button) => {
    onToggle(dataKey, { ...button, alarmSound: !button.alarmSound });
  };

  return (
    <AlertButtonsContainer>
      <AlertButtonsTitle>
        {t("personalSafety_Alert_Button_Settings")}
      </AlertButtonsTitle>
      <AlertButtonsList>
        {alertButtons.map((button) => {
          const isExpanded = expandedButton === button.key;

          return (
            <div key={button.key}>
              <AlertButtonItem>
                <AlertButtonLeft onClick={() => handleButtonClick(button.key)}>
                  <MdChevronRight
                    size={20}
                    color="#9ca3af"
                    style={{
                      transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 0.3s ease",
                      cursor: "pointer",
                    }}
                  />
                  <AlertButtonLabel style={{ cursor: "pointer" }}>
                    {t(button.label)}
                  </AlertButtonLabel>
                </AlertButtonLeft>
                <Switch
                  checked={button.isEnabled}
                  onChange={() =>
                    onToggle(button.dataKey, {
                      ...button,
                      isEnabled: !button.isEnabled,
                    })
                  }
                  onColor="rgb(76, 217, 100)"
                />
              </AlertButtonItem>
              {isExpanded && (
                <AlertButtonDetails
                  message={button.alertMessage}
                  flashlightOn={button.flashOn}
                  alarmSound={button.alarmSound}
                  isEnabled={button.isEnabled}
                  onMessageChange={(value) =>
                    handleMessageChange(button.key, value)
                  }
                  onFlashlightToggle={() =>
                    handleFlashlightToggle(button.dataKey, button)
                  }
                  onAlarmToggle={() =>
                    handleAlarmToggle(button.dataKey, button)
                  }
                  showButtons={true}
                  hideFlashlight={button.hideFlashlight}
                  hideAlarm={button.hideAlarm}
                />
              )}
            </div>
          );
        })}
      </AlertButtonsList>
    </AlertButtonsContainer>
  );
};

export default AlertButtonsSettings;
