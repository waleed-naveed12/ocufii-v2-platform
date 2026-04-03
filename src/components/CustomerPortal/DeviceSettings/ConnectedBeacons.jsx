import React from "react";
import {
  RightSection,
  SettingsSection,
  SectionTitle,
  BeaconsTable,
  BeaconsTableHeader,
  BeaconsTableHeaderCell,
  BeaconsTableBody,
  BeaconsTableRow,
  BeaconsTableCell,
  BeaconAvatar,
  BeaconStatusIndicator,
  BeaconStatusBadge,
  ActionButtons,
  CancelButton,
} from "../../../styles/CustomerPortal/DeviceDetails.styled";
import { getDeviceIcon } from "../../../utility/CustomerPortal/DeviceMapping";
import { useTranslation } from "react-i18next";

const ConnectedBeacons = ({ beacons, onBack }) => {
  const { t } = useTranslation();
  // console.log("Connected beacons:", beacons);
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "online":
        return "online";
      case "offline":
        return "offline";
      default:
        return "default";
    }
  };

  return (
    <RightSection>
      <SettingsSection>
        <SectionTitle>{t("devices_Beacon").toUpperCase()}</SectionTitle>
        <BeaconsTable>
          <BeaconsTableHeader>
            <BeaconsTableRow>
              <BeaconsTableHeaderCell></BeaconsTableHeaderCell>
              <BeaconsTableHeaderCell>
                {t("devices_Beacon")}
              </BeaconsTableHeaderCell>
              <BeaconsTableHeaderCell>
                {t("devices_Status")}
              </BeaconsTableHeaderCell>
              <BeaconsTableHeaderCell>
                {t("devices_Location")}
              </BeaconsTableHeaderCell>
              <BeaconsTableHeaderCell>
                {t("devices_Mac_Address")}
              </BeaconsTableHeaderCell>
              <BeaconsTableHeaderCell>
                {t("devices_Battery")}
              </BeaconsTableHeaderCell>
            </BeaconsTableRow>
          </BeaconsTableHeader>
          <BeaconsTableBody>
            {beacons.map((beacon, index) => (
              <BeaconsTableRow key={index}>
                <BeaconsTableCell>
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <BeaconAvatar
                      src={getDeviceIcon(beacon.beaconType.toString())}
                      alt={beacon.name}
                    />
                    <BeaconStatusIndicator
                      status={beacon.status?.toLowerCase()}
                    />
                  </div>
                </BeaconsTableCell>
                <BeaconsTableCell>{beacon.name}</BeaconsTableCell>
                <BeaconsTableCell>
                  <BeaconStatusBadge status={getStatusColor(beacon.status)}>
                    {t(`dashboard_${beacon.status}`)}
                  </BeaconStatusBadge>
                </BeaconsTableCell>
                <BeaconsTableCell>
                  {beacon.location === "" ? "N/A" : beacon.location}
                </BeaconsTableCell>
                <BeaconsTableCell>{beacon.macAddress}</BeaconsTableCell>
                <BeaconsTableCell>
                  {beacon.battery ? `${beacon.battery} %` : "N/A"}
                </BeaconsTableCell>
              </BeaconsTableRow>
            ))}
          </BeaconsTableBody>
        </BeaconsTable>
      </SettingsSection>

      <ActionButtons>
        <CancelButton onClick={onBack}>{t("txt_back")}</CancelButton>
      </ActionButtons>
    </RightSection>
  );
};

export default ConnectedBeacons;
