import React from "react";
import {
  DeviceHealthContainer,
  DeviceHealthHeader,
  DeviceHealthList,
  DeviceHealthItem,
  DeviceIcon,
  DeviceInfo,
  DeviceName,
  DeviceCount,
  DeviceStats,
  StatColumn,
  StatLabel,
  StatValue,
  StatTime,
} from "../../../styles/CustomerPortal/SystemOverview.styled";
import { getDeviceIcon } from "../../../utility/CustomerPortal/DeviceMapping";

import { formatDateTime } from "../../../utility/CustomerPortal/TimeFormat";
import { useTranslation } from "react-i18next";

const DeviceHealthCard = ({ deviceHealthData }) => {
  const { t } = useTranslation();
  // Use API data if available, otherwise fall back to devices prop
  const displayDevices = (deviceHealthData || []).map((device) => ({
    icon: getDeviceIcon(device.deviceType.toString()),
    count: device.totalCount,
    name: device.deviceTypeName,
    online: device.onlineCount,
    offline: device.offlineCount,
    snooze: device.snoozeCount,
    offlineTime: device.lastOnlineTime
      ? formatDateTime(device.lastOnlineTime)
      : "N/A",
  }));

  return (
    <DeviceHealthContainer>
      <DeviceHealthHeader>{t("dashboard_Device_Health")}</DeviceHealthHeader>
      <DeviceHealthList>
        {displayDevices.map((device, index) => (
          <DeviceHealthItem key={index}>
            <DeviceIcon>
              <img src={device.icon} alt={device.name} />
            </DeviceIcon>
            <DeviceInfo>
              <DeviceCount>{device.count}</DeviceCount>
              <DeviceName>
                {t(`devices_${device.name.toLowerCase()}`)}
              </DeviceName>
            </DeviceInfo>
            <DeviceStats>
              <StatColumn>
                <StatLabel>{t("dashboard_Online")}</StatLabel>
                <StatValue $status="online">{device.online}</StatValue>
              </StatColumn>
              <StatColumn>
                <StatLabel>{t("dashboard_Offline")}</StatLabel>
                <StatValue $status="offline">{device.offline}</StatValue>
                <StatTime>{device.offlineTime}</StatTime>
              </StatColumn>
              <StatColumn>
                <StatLabel>{t("dashboard_Snooze")}</StatLabel>
                <StatValue $status="snooze">{device.snooze}</StatValue>
              </StatColumn>
            </DeviceStats>
          </DeviceHealthItem>
        ))}
      </DeviceHealthList>
    </DeviceHealthContainer>
  );
};

export default DeviceHealthCard;
