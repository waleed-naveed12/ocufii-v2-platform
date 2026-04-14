import React, { useState } from "react";
import {
  RightSection,
  SettingsSection,
  SectionTitle,
  SettingsList,
  SettingItem,
  SettingItemLeft,
  SettingItemTitle,
  SettingItemSubtitle,
  SettingItemRight,
  ActionButtons,
  CancelButton,
  SaveButton,
} from "../../../styles/CustomerPortal/DeviceDetails.styled";
import snoozeBell from "../../../assets/CustomerPortal/images/alarm-bell-sleep-1.svg";
import moment from "moment";
import { useTranslation } from "react-i18next";

const GeneralSettings = ({
  deviceType,
  formData,
  deviceData,
  onCancel,
  onSave,
  onBeaconsClick,
  onSnoozeClick,
}) => {
  const { t } = useTranslation();
  const [editingField, setEditingField] = useState(null);
  const [localFormData, setLocalFormData] = useState(formData);
  // console.log("local form data render:", localFormData);

  React.useEffect(() => {
    setLocalFormData((prev) => ({ ...prev, snoozeEndTime: formData.snoozeEndTime }));
  }, [formData.snoozeEndTime]);

  const getSnoozeTimeRemaining = () => {
    // console.log("Calculating snooze time for:", localFormData.snoozeEndTime);
    if (!localFormData.snoozeEndTime || localFormData.snoozeEndTime === "") {
      return "Off";
    }

    const endTime = moment.utc(localFormData.snoozeEndTime).local();
    const now = moment();
    const diffMs = endTime.diff(now);

    if (diffMs <= 0) {
      return "Off";
    }

    const duration = moment.duration(diffMs);
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 16px",
          backgroundColor: "#FFF4E6",
          border: "2px solid #FF9933",
          borderRadius: "8px",
          color: "#FF9933",
          fontSize: "14px",
          fontWeight: "600",
        }}
      >
        <img
          src={snoozeBell}
          alt="snooze"
          style={{ width: "20px", height: "20px" }}
        />
        {hours}H {minutes}M Remaining
      </div>
    );
  };

  const handleFieldClick = (fieldName) => {
    setEditingField(fieldName);
  };

  const handleInputChange = (fieldName, value) => {
    setLocalFormData({
      ...localFormData,
      [fieldName]: value,
    });
  };

  const handleInputBlur = () => {
    setEditingField(null);
  };

  const hasChanges =
    localFormData.name !== formData.name ||
    localFormData.location !== formData.location ||
    localFormData.information !== formData.information;

  const handleSave = () => {
    onSave(localFormData);
  };

  return (
    <RightSection>
      <SettingsSection>
        <SectionTitle>{t("txt_general")}</SectionTitle>
        <SettingsList>
          {deviceType === "Card" ? (
            <>
              <SettingItem onClick={() => handleFieldClick("name")}>
                <SettingItemLeft>
                  <SettingItemTitle>
                    {t("txt_safety_card_name")}
                  </SettingItemTitle>
                  <SettingItemSubtitle>
                    {t("txt_safety_placeholder")}
                  </SettingItemSubtitle>
                </SettingItemLeft>
                <SettingItemRight>
                  {editingField === "name" ? (
                    <input
                      type="text"
                      value={localFormData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      onBlur={handleInputBlur}
                      autoFocus
                      style={{
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        padding: "8px 12px",
                        fontSize: "14px",
                        width: "200px",
                        outline: "none",
                        backgroundColor: "#fff",
                        color: "#333",
                        colorScheme: "light",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      {localFormData.name}
                      {/* <span className="arrow">â€º</span> */}
                    </>
                  )}
                </SettingItemRight>
              </SettingItem>

              <SettingItem onClick={() => handleFieldClick("information")}>
                <SettingItemLeft>
                  <SettingItemTitle>
                    {t("txt_safety_card_information")}
                  </SettingItemTitle>
                  <SettingItemSubtitle>
                    {t("txt_placeholder_2")}
                  </SettingItemSubtitle>
                </SettingItemLeft>
                <SettingItemRight>
                  {editingField === "information" ? (
                    <input
                      type="text"
                      value={localFormData.information}
                      onChange={(e) =>
                        handleInputChange("information", e.target.value)
                      }
                      onBlur={handleInputBlur}
                      autoFocus
                      placeholder={`${t("txt_optional")}`}
                      style={{
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        padding: "8px 12px",
                        fontSize: "14px",
                        width: "200px",
                        outline: "none",
                        backgroundColor: "#fff",
                        color: "#333",
                        colorScheme: "light",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      {localFormData.information || `(${t("txt_optional")})`}
                      {/* <span className="arrow">â€º</span> */}
                    </>
                  )}
                </SettingItemRight>
              </SettingItem>

              <SettingItem onClick={onSnoozeClick}>
                <SettingItemLeft>
                  <SettingItemTitle>
                    {t("txt_safety_card_notification")}
                  </SettingItemTitle>
                  <SettingItemSubtitle>
                    {t("txt_safety_snooze")}
                  </SettingItemSubtitle>
                </SettingItemLeft>
                <SettingItemRight>
                  <>
                    {getSnoozeTimeRemaining()}
                    {/* <span className="arrow">â€º</span> */}
                  </>
                </SettingItemRight>
              </SettingItem>

              <SettingItem>
                <SettingItemLeft>
                  <SettingItemTitle>{t("txt_card_config")}</SettingItemTitle>
                  <SettingItemSubtitle>
                    {t("txt_card_config_2")}
                  </SettingItemSubtitle>
                </SettingItemLeft>
                <SettingItemRight>
                  {/* <span className="arrow">â€º</span> */}
                </SettingItemRight>
              </SettingItem>
            </>
          ) : (
            <>
              <SettingItem onClick={() => handleFieldClick("name")}>
                <SettingItemLeft>
                  <SettingItemTitle>
                    {t(`devices_${deviceType.toLowerCase()}`)}{" "}
                    {t("devices_Name").toLocaleLowerCase()}
                  </SettingItemTitle>
                  <SettingItemSubtitle>
                    {t("txt_enter")}{" "}
                    {t(`devices_${deviceType.toLowerCase()}`).toLowerCase()}
                    's {t("devices_Name").toLowerCase()}
                  </SettingItemSubtitle>
                </SettingItemLeft>
                <SettingItemRight>
                  {editingField === "name" ? (
                    <input
                      type="text"
                      value={localFormData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      onBlur={handleInputBlur}
                      autoFocus
                      style={{
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        padding: "8px 12px",
                        fontSize: "14px",
                        width: "200px",
                        outline: "none",
                        backgroundColor: "#fff",
                        color: "#333",
                        colorScheme: "light",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      {localFormData.name}
                      {/* <span className="arrow">â€º</span> */}
                    </>
                  )}
                </SettingItemRight>
              </SettingItem>

              <SettingItem onClick={() => handleFieldClick("location")}>
                <SettingItemLeft>
                  <SettingItemTitle>
                    {t(`devices_${deviceType.toLowerCase()}`)}{" "}
                    {t("devices_Location_small").toLocaleLowerCase()}
                  </SettingItemTitle>
                  <SettingItemSubtitle>
                    {t("txt_enter")}{" "}
                    {t(`devices_${deviceType.toLowerCase()}`).toLowerCase()}
                    's {t("devices_Location_small").toLowerCase()}
                  </SettingItemSubtitle>
                </SettingItemLeft>
                <SettingItemRight>
                  {editingField === "location" ? (
                    <input
                      type="text"
                      value={localFormData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      onBlur={handleInputBlur}
                      autoFocus
                      placeholder={`${t("txt_optional")}`}
                      style={{
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        padding: "8px 12px",
                        fontSize: "14px",
                        width: "200px",
                        outline: "none",
                        backgroundColor: "#fff",
                        color: "#333",
                        colorScheme: "light",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      {localFormData.location || `(${t("txt_optional")})`}
                      {/* <span className="arrow">â€º</span> */}
                    </>
                  )}
                </SettingItemRight>
              </SettingItem>

              <SettingItem onClick={() => handleFieldClick("information")}>
                <SettingItemLeft>
                  <SettingItemTitle>
                    {t(`devices_${deviceType.toLowerCase()}`)}{" "}
                    {t("devices_Location_small").toLocaleLowerCase()}{" "}
                    {t("txt_info")}
                  </SettingItemTitle>
                  <SettingItemSubtitle>
                    {t("txt_info_desc")}{" "}
                    {t(`devices_${deviceType.toLowerCase()}`).toLowerCase()}
                  </SettingItemSubtitle>
                </SettingItemLeft>
                <SettingItemRight>
                  {editingField === "information" ? (
                    <input
                      type="text"
                      value={localFormData.information}
                      onChange={(e) =>
                        handleInputChange("information", e.target.value)
                      }
                      onBlur={handleInputBlur}
                      autoFocus
                      placeholder={`${t("txt_optional")}`}
                      style={{
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        padding: "8px 12px",
                        fontSize: "14px",
                        width: "200px",
                        outline: "none",
                        backgroundColor: "#fff",
                        color: "#333",
                        colorScheme: "light",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      {localFormData.information || `(${t("txt_optional")})`}
                      {/* <span className="arrow">â€º</span> */}
                    </>
                  )}
                </SettingItemRight>
              </SettingItem>
              {deviceType !== "Hub" && (
                <SettingItem onClick={onSnoozeClick}>
                  <SettingItemLeft>
                    <SettingItemTitle>
                      {t(`devices_${deviceType.toLowerCase()}`)}{" "}
                      {t("txt_hub_snooze")}
                    </SettingItemTitle>
                    <SettingItemSubtitle>
                      {t("txt_set")}{" "}
                      {t(`devices_${deviceType.toLowerCase()}`).toLowerCase()}{" "}
                      {t("txt_hub_snooze2").toLowerCase()}
                    </SettingItemSubtitle>
                  </SettingItemLeft>
                  <SettingItemRight>
                    <>
                      {getSnoozeTimeRemaining()}
                      {/* <span className="arrow">â€º</span> */}
                    </>
                  </SettingItemRight>
                </SettingItem>
              )}

              {deviceType === "Hub" && (
                <SettingItem onClick={onBeaconsClick}>
                  <SettingItemLeft>
                    <SettingItemTitle>
                      {t("txt_connected_beacon")}
                    </SettingItemTitle>
                    <SettingItemSubtitle>{t("txt_desc_2")}</SettingItemSubtitle>
                  </SettingItemLeft>
                  <SettingItemRight>
                    {deviceData.connectedBeacons || 0}
                    {/* <span className="arrow">â€º</span> */}
                  </SettingItemRight>
                </SettingItem>
              )}
            </>
          )}
        </SettingsList>
      </SettingsSection>

      <ActionButtons>
        <CancelButton onClick={onCancel}>{t("txt_cancel")}</CancelButton>
        <SaveButton
          onClick={handleSave}
          disabled={
            !hasChanges || (deviceType !== "Hub" && deviceType !== "Beacon")
          }
        >
          {t("txt_save_changes")}
        </SaveButton>
      </ActionButtons>
    </RightSection>
  );
};

export default GeneralSettings;
