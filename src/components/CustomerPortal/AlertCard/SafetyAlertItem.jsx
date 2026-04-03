import React, { useState } from "react";
import { AlertItem } from "../../../styles/CustomerPortal/Dashboard.styled";
import phonePng from "../../../assets/CustomerPortal/images/phone.png";
import safetyCardPng from "../../../assets/CustomerPortal/images/safety_card.png";
import { formatDateTime } from "../../../utility/CustomerPortal/TimeFormat";
import {
  getSafetyAlertIcon,
  getSafetyAlertTranslationString,
} from "../../../utility/CustomerPortal/DeviceMapping";
import NoLocationModal from "../NoLocationModal";
import { useTranslation } from "react-i18next";

const SafetyAlertItem = ({
  alert,
  onView,
  onSeeRecipients,
  onAlertAction,
  isSelected,
  showRecipients,
  showEmergencyServices,
}) => {
  const { t } = useTranslation();
  const [showNoLocationModal, setShowNoLocationModal] = useState(false);
  const iconData = getSafetyAlertIcon(alert.notificationReason);
  const IconComponent = iconData.Component;

  const hasValidLocation =
    alert.lat && alert.lng && alert.lat !== "" && alert.lng !== "";

  const handleViewClick = (callback) => {
    if (!hasValidLocation) {
      setShowNoLocationModal(true);
    } else {
      callback && callback(alert);
    }
  };

  return (
    <AlertItem $isSelected={isSelected}>
      <div className="alert-header">
        <div className="alert-left">
          <div className="alert-bell-icon">
            {iconData.type === "image" ? (
              <img
                src={iconData.src}
                alt={iconData.alt}
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              <IconComponent style={{ fontSize: "100%" }} />
            )}
          </div>
          <div className="alert-info">
            <span className="alert-name">
              {alert.title === null ? "N/A" : alert.title}
            </span>
            <span className="alert-category">
              {t(getSafetyAlertTranslationString(alert.notificationReason))}
            </span>
          </div>
        </div>
        <div className="alert-datetime">
          <span className="datetime">{formatDateTime(alert.duration)}</span>

          {alert.notificationType === "11" ? (
            <div className="alert-device-icon">
              <img
                src={safetyCardPng}
                alt="Safety Card"
                style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))" }}
              />
            </div>
          ) : (
            <div className="alert-device-icon2">
              <img src={phonePng} alt="Phone" />
            </div>
          )}
        </div>
      </div>
      <div className="alert-actions">
        <button
          className="see-recipients-button"
          onClick={(e) => {
            e.stopPropagation();
            handleViewClick(onSeeRecipients);
          }}
          style={
            showRecipients
              ? {
                  background:
                    "linear-gradient(135deg, rgba(86, 216, 248, 1), rgba(0, 179, 223, 1))",
                  color: "white",
                }
              : {}
          }
        >
          {t("dashboard_View_Safety_Network")}
        </button>
        <button
          className="emergency-services-button"
          onClick={(e) => {
            e.stopPropagation();
            handleViewClick(onView);
          }}
          style={
            showEmergencyServices
              ? {
                  background:
                    "linear-gradient(135deg, rgba(86, 216, 248, 1), rgba(0, 179, 223, 1))",
                  color: "white",
                }
              : {}
          }
        >
          {t("dashboard_View_Emergency_Services")}
        </button>
      </div>
      <button
        className="alert-action-button"
        onClick={(e) => {
          e.stopPropagation();
          onAlertAction && onAlertAction(alert);
        }}
      >
        {t("dashboard_Alert_Action")}
      </button>

      <NoLocationModal
        isOpen={showNoLocationModal}
        onClose={() => setShowNoLocationModal(false)}
      />
    </AlertItem>
  );
};

export default SafetyAlertItem;
