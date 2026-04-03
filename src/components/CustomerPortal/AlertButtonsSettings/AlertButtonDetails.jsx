import React from "react";
import Switch from "react-ios-switch";
import {
  AlertExpandedContent,
  AlertMessageLabel,
  AlertMessageBox,
  AlertOptionRow,
  AlertOptionLabel,
} from "../../../styles/CustomerPortal/PersonalSafety.styled";
import { useTranslation } from "react-i18next";

const AlertButtonDetails = ({
  message,
  flashlightOn,
  alarmSound,
  screenFlashing,
  isEnabled = true,
  onMessageChange,
  onFlashlightToggle,
  onAlarmToggle,
  onScreenFlashingToggle,
  showButtons = false,
  hideFlashlight = false,
  hideAlarm = false,
}) => {
  const { t } = useTranslation();
  console.log("message is", message);
  return (
    <AlertExpandedContent>
      <AlertMessageLabel>
        {t("personalSafety_Alert_Message_Title")}
      </AlertMessageLabel>
      <AlertMessageBox
        value={t(message)}
        onChange={(e) => onMessageChange(e.target.value)}
        placeholder="Enter alert message..."
        disabled={true}
        readOnly
      />
      {showButtons && (
        <>
          {!hideFlashlight && (
            <AlertOptionRow>
              <AlertOptionLabel>
                {t("personalSafety_Flashlight_On")}
              </AlertOptionLabel>
              <Switch
                checked={flashlightOn}
                onChange={onFlashlightToggle}
                onColor="rgb(76, 217, 100)"
                disabled={!isEnabled}
              />
            </AlertOptionRow>
          )}

          {!hideAlarm && (
            <AlertOptionRow>
              <AlertOptionLabel>
                {t("personalSafety_Alarm_Sound")}
              </AlertOptionLabel>
              <Switch
                checked={alarmSound}
                onChange={onAlarmToggle}
                onColor="rgb(76, 217, 100)"
                disabled={!isEnabled}
              />
            </AlertOptionRow>
          )}
        </>
      )}
    </AlertExpandedContent>
  );
};

export default AlertButtonDetails;
