import React from "react";
import { AlertItem } from "../../../styles/CustomerPortal/Dashboard.styled";

import { formatDateTime } from "../../../utility/CustomerPortal/TimeFormat";
import {
  getDeviceIcon,
  getSubcategoryTranslation,
} from "../../../utility/CustomerPortal/DeviceMapping";
import { useTranslation } from "react-i18next";

const SystemAlertItem = ({ alert, onView, onAlertAction, isSelected }) => {
  const { t } = useTranslation();

  return (
    <AlertItem className="system-alert" $isSelected={isSelected}>
      <div className="alert-header">
        <div className="alert-left">
          <div className="device-image-wrapper">
            <img src={getDeviceIcon(alert.deviceType)} alt="Device" />
          </div>
          <div className="alert-info">
            <span className="alert-name">
              {alert.title === null ? "N/A" : alert.title}
            </span>
            {alert.deviceType !== 1 ? null : (
              <span className="alert-category">{t("wifi_hub_alert")}</span>
            )}

            <span className="alert-subcategory">
              {t(getSubcategoryTranslation(alert.notificationType))}
            </span>
          </div>
        </div>
        <div className="alert-datetime">
          <span className="datetime">{formatDateTime(alert.duration)}</span>
        </div>
      </div>
      <button
        className="alert-action-button yellow"
        onClick={(e) => {
          e.stopPropagation();
          onAlertAction && onAlertAction(alert);
        }}
      >
        {t("dashboard_Alert_Action")}
      </button>
    </AlertItem>
  );
};

export default SystemAlertItem;
