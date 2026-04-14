import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "../../../Layout/CustomerPortal/DashboardLayout";
import GeneralSettings from "../../../components/CustomerPortal/DeviceSettings/GeneralSettings";
import DeleteDevice from "../../../components/CustomerPortal/DeviceSettings/DeleteDevice";
import ConnectedBeacons from "../../../components/CustomerPortal/DeviceSettings/ConnectedBeacons";
import SnoozeMode from "../../../components/CustomerPortal/DeviceSettings/SnoozeMode";
import TwoFactor from "../email/TwoFactor";
import DeleteGatewayEmailStep from "../../../components/CustomerPortal/DeviceSettings/DeleteGatewayEmailStep";
import DeleteGatewayVerifiedStep from "../../../components/CustomerPortal/DeviceSettings/DeleteGatewayVerifiedStep";
import DeleteBeaconEmailStep from "../../../components/CustomerPortal/DeviceSettings/DeleteBeaconEmailStep";
import DeleteBeaconVerifiedStep from "../../../components/CustomerPortal/DeviceSettings/DeleteBeaconVerifiedStep";
import { useUser } from "../../../context/CustomerPortal/UserContext";
import {
  getAllDevices,
  updateGatewayAPI,
  updateBeaconAPI,
  stopSnooze,
} from "../../../api/CustomerPortal/DevicesApi";
import Toast from "../../../utility/CustomerPortal/Toast";
import deleteIcon from "../../../assets/CustomerPortal/images/delete.svg";
import {
  DeviceDetailsContainer,
  Breadcrumb,
  PageTitle,
  DeviceDetailsCard,
  LeftSection,
  DeviceHeader,
  DeviceImageWrapper,
  DeviceImage,
  OnlineIndicator,
  OfflineIndicator,
  DeviceName,
  DeviceStatus,
  DeviceInfoGrid,
  DeviceInfoItem,
  DeviceInfoLabel,
  DeviceInfoValue,
  SectionTitle,
  AdvancedSection,
  DeleteButton,
} from "../../../styles/CustomerPortal/DeviceDetails.styled";
import { ROUTE } from "../../../common/CustomerPortal/Routes";
import { useTranslation } from "react-i18next";

const DeviceDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { t } = useTranslation();
  const deviceData = location.state?.device || {};
  // console.log("Device Data:", deviceData);

  const { data: devicesData, refetch: refetchDevices } = useQuery({
    queryKey: ["devices", user?.email],
    queryFn: () => getAllDevices(user?.email),
    enabled: !!user?.email,
    refetchInterval: 5000,
  });

  const [formData, setFormData] = useState({
    name: deviceData.hubName || deviceData.beaconName || deviceData.name || "",
    location: deviceData.location || "",
    information: deviceData.information || "",
    NotificationSnooze: deviceData.NotificationSnooze || "Disabled",
    avatar: deviceData.avatar || deviceData.image || "",
    battery: deviceData.battery || "N/A",
    beacon: deviceData.beacon || false,
    beaconSettings: deviceData.beaconSettings || "",
    beaconTypeName: deviceData.beaconTypeName || "FLEXIBANDS",
    communication: deviceData.communication || "WiFi Hub",
    dateCreated: deviceData.dateCreated || "2024-12-01T09:15:30",
    id: deviceData.id || 0,
    lastOnline: deviceData.lastOnline || "2026-01-06T11:26:10",
    macAddress: deviceData.macAddress || "F8AA48040CD7",
    snoozeEndTime: deviceData.snoozeEndTime || "2026-01-07T18:19:31",
    status: deviceData.status || "Offline",
    type: deviceData.type || 3,
  });

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showConnectedBeacons, setShowConnectedBeacons] = useState(false);
  const [showSnoozeMode, setShowSnoozeMode] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [showResendEmail, setShowResendEmail] = useState(false);
  const [showVerifiedStep, setShowVerifiedStep] = useState(false);
  const [showBeaconResendEmail, setShowBeaconResendEmail] = useState(false);
  const [showBeaconVerifiedStep, setShowBeaconVerifiedStep] = useState(false);
  const [pendingDeleteMAC, setPendingDeleteMAC] = useState("");

  // Filter beacons connected to this hub
  const getConnectedBeacons = () => {
    if (!devicesData?.data?.beacons?.devices || !deviceData.macAddress)
      return [];
    return devicesData.data.beacons.devices.filter(
      (beacon) => beacon.gatewayMAC === deviceData.macAddress,
    );
  };

  // Create enhanced device data with actual connected beacons count
  // and resolved gatewayMAC from live API data for beacons
  const getLiveGatewayMAC = () => {
    if (!devicesData?.data?.beacons?.devices || !deviceData.macAddress) {
      return deviceData.gatewayMAC || "";
    }
    const liveBeacon = devicesData.data.beacons.devices.find(
      (b) => b.macAddress === deviceData.macAddress,
    );
    return liveBeacon?.gatewayMAC || deviceData.gatewayMAC || "";
  };

  const enhancedDeviceData = {
    ...deviceData,
    connectedBeacons: getConnectedBeacons().length,
    gatewayMAC: getLiveGatewayMAC(),
  };

  const stoppedSnoozeRef = React.useRef(new Set());

  // Sync snooze fields from live API whenever devicesData refreshes
  // Also auto-stop snooze if snoozeEndTime has passed
  React.useEffect(() => {
    if (!devicesData) return;
    const liveBeacon = devicesData?.data?.beacons?.devices?.find(
      (b) => b.macAddress === deviceData.macAddress,
    );
    if (liveBeacon) {
      const isExpired =
        liveBeacon.snoozeEndTime
          ? new Date(liveBeacon.snoozeEndTime + "Z") < new Date()
          : true;

      setFormData((prev) => ({
        ...prev,
        NotificationSnooze: liveBeacon.notificationSnooze || "Disabled",
        snoozeEndTime: isExpired ? "" : (liveBeacon.snoozeEndTime || ""),
      }));

      if (liveBeacon.snoozeEndTime && user?.email) {
        const endTime = new Date(liveBeacon.snoozeEndTime + "Z");
        const now = new Date();
        if (endTime < now) {
          if (!stoppedSnoozeRef.current.has(liveBeacon.macAddress)) {
            stoppedSnoozeRef.current.add(liveBeacon.macAddress);
            stopSnooze({ email: user.email, mac: liveBeacon.macAddress }).catch(() => {
              stoppedSnoozeRef.current.delete(liveBeacon.macAddress);
            });
          }
        } else {
          // Snooze is still active — reset so Stop fires again when it next expires
          stoppedSnoozeRef.current.delete(liveBeacon.macAddress);
        }
      }
    }
  }, [devicesData]);

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSave = async (updatedFormData) => {
    if (deviceType === "Hub") {
      try {
        await updateGatewayAPI({
          email: user?.email,
          gatewayMAC: formData.macAddress,
          deviceName: updatedFormData.name,
          gatewayLocation: updatedFormData.location,
          comments: updatedFormData.information,
        });
        Toast.success("Device settings saved successfully.");
        setFormData(updatedFormData);
      } catch {
        Toast.error("Failed to save device settings. Please try again.");
      }
    } else if (deviceType === "Beacon") {
      try {
        await updateBeaconAPI({
          email: user?.email,
          beaconMAC: formData.macAddress,
          beaconName: updatedFormData.name,
          beaconLocation: updatedFormData.location,
          comments: updatedFormData.information,
        });
        Toast.success("Device settings saved successfully.");
        setFormData(updatedFormData);
      } catch {
        Toast.error("Failed to save device settings. Please try again.");
      }
    } else {
      setFormData(updatedFormData);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirmation(false);
    if (deviceType === "Hub") {
      setPendingDeleteMAC(formData.macAddress);
      setShowResendEmail(true);
    } else if (deviceType === "Beacon") {
      setPendingDeleteMAC(formData.macAddress);
      setShowBeaconResendEmail(true);
    } else {
      setShowTwoFactor(true);
    }
  };

  const handleTwoFactorSuccess = () => {
    console.log("Device deleted successfully after verification");
    // Add your actual delete API call here
    setShowTwoFactor(false);
  };

  const handleBeaconsClick = () => {
    setShowConnectedBeacons(true);
  };

  const handleBackFromBeacons = () => {
    setShowConnectedBeacons(false);
  };

  const handleSnoozeClick = () => {
    if (deviceType == "Card") return;
    setShowSnoozeMode(true);
  };

  const handleBackFromSnooze = async () => {
    await refetchDevices();
    setShowSnoozeMode(false);
  };

  const getDeviceType = () => {
    if (deviceData.hub) return "Hub";
    if (deviceData.beacon) return "Beacon";
    if (deviceData.lock) return "Lock";
    if (deviceData.safetyCard) return "Card";
    return "Device";
  };

  const deviceType = getDeviceType();

  return (
    <DashboardLayout>
      <DeviceDetailsContainer>
        <PageTitle>{t("menu_devices")}</PageTitle>
        <Breadcrumb>
          <span className="clickable" onClick={() => navigate(ROUTE.DEVICES)}>
            {t("menu_devices")}
          </span>
          <span className="separator">/</span>
          <span
          // className="clickable"
          // onClick={() => navigate("/dashboard/devices")}
          >
            {t(`devices_${deviceType.toLowerCase()}s`)}
          </span>
          <span className="separator">/</span>
          <span className="active">{t("devices_Settings")}</span>
        </Breadcrumb>

        <DeviceDetailsCard>
          {/* Left Section - Device Info */}
          <LeftSection>
            <DeviceHeader>
              <DeviceImageWrapper>
                <DeviceImage
                  src={deviceData.avatar || deviceData.image}
                  alt={formData.name}
                />
                {deviceData.status?.toLowerCase() === "online" ? (
                  <OnlineIndicator />
                ) : (
                  <OfflineIndicator />
                )}
              </DeviceImageWrapper>
              <DeviceName>{formData.name}</DeviceName>
              <DeviceStatus status={deviceData.status}>
                {t(`dashboard_${deviceData.status}`) || t("dashboard_Online")}
              </DeviceStatus>
            </DeviceHeader>

            {deviceType === "Card" ? (
              <>
                <DeviceInfoGrid>
                  <DeviceInfoItem>
                    <DeviceInfoLabel>{t("txt_communication")}:</DeviceInfoLabel>
                    <DeviceInfoValue>
                      {deviceData.cellularNetwork || "N/A"}
                    </DeviceInfoValue>
                  </DeviceInfoItem>
                  <DeviceInfoItem>
                    <DeviceInfoLabel>
                      {t("devices_Location_small")}:
                    </DeviceInfoLabel>
                    <DeviceInfoValue>
                      {deviceData.location &&
                      deviceData.location.trim() !== "" &&
                      deviceData.location !== "View Location"
                        ? deviceData.location
                        : "N/A"}
                    </DeviceInfoValue>
                  </DeviceInfoItem>
                  <DeviceInfoItem>
                    <DeviceInfoLabel>
                      {t("devices_Mac_Address_small")}:
                    </DeviceInfoLabel>
                    <DeviceInfoValue>
                      {deviceData.safetyCardMAC ||
                        deviceData.macAddress ||
                        "N/A"}
                    </DeviceInfoValue>
                  </DeviceInfoItem>
                  <DeviceInfoItem>
                    <DeviceInfoLabel>{t("txt_imei")}:</DeviceInfoLabel>
                    <DeviceInfoValue>
                      {deviceData.firmware || "N/A"}
                    </DeviceInfoValue>
                  </DeviceInfoItem>
                </DeviceInfoGrid>

                <AdvancedSection>
                  <SectionTitle>{t("txt_advanced_settings")}</SectionTitle>
                  <DeleteButton
                    style={{
                      background: "#17a2b8",
                      border: "2px solid #17a2b8",
                      color: "white",
                      marginBottom: "12px",
                    }}
                    disabled
                  >
                    {t("txt_request")}
                  </DeleteButton>
                  <DeleteButton onClick={handleDeleteClick} disabled>
                    <img src={deleteIcon} alt="Delete" />
                    {t("txt_del_safety_card")}
                  </DeleteButton>
                </AdvancedSection>
              </>
            ) : (
              <>
                <DeviceInfoGrid>
                  <DeviceInfoItem>
                    <DeviceInfoLabel>
                      {t("devices_Location_small")}::
                    </DeviceInfoLabel>
                    <DeviceInfoValue>
                      {deviceData.location || "N/A"}
                    </DeviceInfoValue>
                  </DeviceInfoItem>
                  <DeviceInfoItem>
                    <DeviceInfoLabel>{t("txt_wifi_network")}:</DeviceInfoLabel>
                    <DeviceInfoValue>
                      {deviceData.wifiNetwork || deviceData.network || "N/A"}
                    </DeviceInfoValue>
                  </DeviceInfoItem>
                  <DeviceInfoItem>
                    <DeviceInfoLabel>
                      {t("devices_Mac_Address_small")}:
                    </DeviceInfoLabel>
                    <DeviceInfoValue>
                      {deviceData.macAddress || deviceData.mac || "N/A"}
                    </DeviceInfoValue>
                  </DeviceInfoItem>
                </DeviceInfoGrid>

                <AdvancedSection>
                  <SectionTitle>{t("txt_advanced_settings")}</SectionTitle>
                  <DeleteButton onClick={handleDeleteClick}>
                    <img src={deleteIcon} alt="Delete" />
                    {t("txt_del")} {t(`devices_${deviceType}`).toUpperCase()}
                  </DeleteButton>
                </AdvancedSection>
              </>
            )}
          </LeftSection>

          {/* Right Section - General Settings or Delete Confirmation */}
          {showTwoFactor ? (
            <TwoFactor
              deviceType={deviceType}
              deviceName={formData.name}
              onCancel={() => setShowTwoFactor(false)}
              onSuccess={handleTwoFactorSuccess}
            />
          ) : showResendEmail ? (
            <DeleteGatewayEmailStep
              email={user?.email}
              onVerified={() => { setShowResendEmail(false); setShowVerifiedStep(true); }}
            />
          ) : showVerifiedStep ? (
            <DeleteGatewayVerifiedStep
              email={user?.email}
              mac={pendingDeleteMAC}
            />
          ) : showBeaconResendEmail ? (
            <DeleteBeaconEmailStep
              email={user?.email}
              onVerified={() => { setShowBeaconResendEmail(false); setShowBeaconVerifiedStep(true); }}
            />
          ) : showBeaconVerifiedStep ? (
            <DeleteBeaconVerifiedStep
              email={user?.email}
              mac={pendingDeleteMAC}
            />
          ) : showDeleteConfirmation ? (
            <DeleteDevice
              deviceType={deviceType}
              deviceName={formData.name}
              onCancel={handleCancelDelete}
              onConfirm={handleConfirmDelete}
            />
          ) : showConnectedBeacons ? (
            <ConnectedBeacons
              beacons={getConnectedBeacons()}
              onBack={handleBackFromBeacons}
            />
          ) : showSnoozeMode ? (
            <SnoozeMode
              deviceType={deviceType}
              deviceData={{
                ...enhancedDeviceData,
                snoozeEndTime: formData.snoozeEndTime,
              }}
              onBack={handleBackFromSnooze}
            />
          ) : (
            <GeneralSettings
              deviceType={deviceType}
              formData={formData}
              deviceData={enhancedDeviceData}
              onCancel={handleCancel}
              onSave={handleSave}
              onBeaconsClick={handleBeaconsClick}
              onSnoozeClick={handleSnoozeClick}
            />
          )}
        </DeviceDetailsCard>
      </DeviceDetailsContainer>
    </DashboardLayout>
  );
};

export default DeviceDetails;
