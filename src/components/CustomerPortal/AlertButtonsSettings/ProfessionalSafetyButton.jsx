import React, { useState } from "react";
import Switch from "react-ios-switch";
import { MdChevronRight } from "react-icons/md";
import {
  AlertButtonsContainer,
  AlertButtonsTitle,
  AlertButtonsList,
  AlertButtonItem,
  AlertButtonLeft,
  AlertButtonLabel,
} from "../../../styles/CustomerPortal/PersonalSafety.styled";
import AlertButtonDetails from "./AlertButtonDetails";

const ProfessionalSafetyButton = ({
  alertSettings,
  onToggle,
  settingsData,
}) => {
  const [expandedButton, setExpandedButton] = useState(null);

  // Map API keys to display labels and alert settings keys
  const buttonConfig = {
    police: {
      label: "Police",
      key: "police",
      hideFlashlight: true,
      hideAlarm: true,
      defaultMessage:
        "I have activated the Police Alert and am receiving assistance from the Professional Dispatch Center. Please stay alert and be ready to provide any information if contacted.",
    },
    emergencyMedicalService: {
      label: "Emergency Medical Service",
      key: "medicalService",
      hideFlashlight: true,
      hideAlarm: true,
      defaultMessage:
        "I have activated the Emergency Medical Service Alert and am receiving assistance from the Professional Dispatch Center. Please stay alert and be ready to provide any information if contacted.",
    },
    fireDepartment: {
      label: "Fire Department",
      key: "fire",
      hideFlashlight: true,
      hideAlarm: true,
      defaultMessage:
        "I have activated the Fire Department Alert and am receiving assistance from the Professional Dispatch Center. Please stay alert and be ready to provide any information if contacted.",
    },
    proActiveShooter: {
      label: "Active Shooter",
      key: "activeShooter",
      hideFlashlight: true,
      hideAlarm: true,
      defaultMessage:
        "I have activated the Active Shooter Alert and am receiving assistance from the Professional Dispatch Center. Please stay alert and be ready to provide any information if contacted.",
    },
    proFeelingUnsafe: {
      label: "Feeling Unsafe",
      key: "feelingUnsafe",
      hideFlashlight: true,
      hideAlarm: true,
      defaultMessage:
        "I have activated the Feeling Unsafe Alert and am receiving assistance from the Professional Dispatch Center. Please stay alert and be ready to provide any information if contacted.",
    },
  };

  // Build alert buttons from settingsData
  const alertButtons = Object.keys(buttonConfig).map((dataKey) => {
    try {
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

  const handleFlashlightToggle = (dataKey, button) => {
    onToggle(dataKey, { ...button, flashOn: !button.flashOn });
  };

  const handleAlarmToggle = (dataKey, button) => {
    onToggle(dataKey, { ...button, alarmSound: !button.alarmSound });
  };

  const handleMessageChange = (dataKey, button, value) => {
    onToggle(dataKey, { ...button, alertMessage: value });
  };

  return (
    <AlertButtonsContainer>
      <AlertButtonsTitle>Alert Buttons Settings</AlertButtonsTitle>
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
                    {button.label}
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
                  onMessageChange={(value) =>
                    handleMessageChange(button.dataKey, button, value)
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

export default ProfessionalSafetyButton;
