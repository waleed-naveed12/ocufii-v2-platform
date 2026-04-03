import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "styled-components";
import { DashboardContent } from "../../styles/CustomerPortal/Dashboard.styled";
import DashboardLayout from "../../Layout/CustomerPortal/DashboardLayout";
import DataTable from "../../components/CustomerPortal/DataTable";
import hubImage from "../../assets/CustomerPortal/images/baseStation.png";
import beaconImg from "../../assets/CustomerPortal/images/beacon.png";
import triggerLockImg from "../../assets/CustomerPortal/images/lockbeacon.png";
import safettyCardImg from "../../assets/CustomerPortal/images/safety_card2.png";
import { useUser } from "../../context/CustomerPortal/UserContext";
import { getAllDevices } from "../../api/CustomerPortal/DevicesApi";
import {
  BeaconColumn,
  HubsColumn,
  ConnectedLocksColumn,
  SafetyWearableCardsColumn,
} from "../../common/CustomerPortal/ExampleData";
import { Loader } from "../../styles/CustomerPortal/Loader";
import { PageTitle } from "../../styles/CustomerPortal/SafetyNetwork.styled";
import { getDeviceIcon } from "../../utility/CustomerPortal/DeviceMapping";
import { useTranslation } from "react-i18next";

const Devices = () => {
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState("All");
  const { user } = useUser();
  const theme = useTheme();

  const {
    data: devicesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["devices", user?.email],
    queryFn: () => getAllDevices(user?.email),
    enabled: !!user?.email,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardContent>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <Loader size="32px" />
            <div style={{ fontSize: "16px", color: "#666" }}>
              {t("txt_loading")}
            </div>
          </div>
        </DashboardContent>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <DashboardContent>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "400px",
              fontSize: "16px",
              color: "#666",
            }}
          >
            {t("txt_loading_device_err")}
          </div>
        </DashboardContent>
      </DashboardLayout>
    );
  }

  // Map API response to table format
  const mapHubsData = (hubs) => {
    if (!hubs?.devices || hubs.devices.length === 0) return [];

    return hubs.devices.map((hub, index) => ({
      id: index + 1,
      avatar: hubImage,
      name: hub.name,
      status: hub.status,
      location: hub.location || "N/A",
      information: hub.information || "",
      wifiNetwork: hub.wifiNetwork ? JSON.parse(hub.wifiNetwork).SSID : "",
      macAddress: hub.macAddress,
      beaconStatus: hub.beaconStatus,
      hubSettings: "Settings",
      hub: true,
      connectedBeacons: hub.connectedBeaconsCount || 0,
    }));
  };

  const mapBeaconsData = (beacons) => {
    if (!beacons?.devices || beacons.devices.length === 0) return [];
    return beacons.devices.map((beacon, index) => ({
      id: index + 1,
      avatar: getDeviceIcon(beacon.beaconType.toString()),
      name: beacon.name,
      status: beacon.status,
      location: beacon.location || "N/A",
      information: beacon.information || "",
      macAddress: beacon.macAddress,
      NotificationSnooze: beacon.notificationSnooze,
      battery: `${beacon.battery}%`,
      beaconSettings: "Settings",
      beacon: true,
      type: beacon.beaconType,
      beaconTypeName: beacon.beaconTypeName,
      communication: beacon.communication,
      dateCreated: beacon.dateCreated,
      lastOnline: beacon.lastOnline,
      snoozeEndTime: beacon.snoozeEndTime,
      gatewayMAC: beacon.gatewayMAC || "",
    }));
  };

  const mapConnectedLocksData = (locks) => {
    if (!locks?.devices || locks.devices.length === 0) return [];
    return locks.devices.map((lock, index) => ({
      id: index + 1,
      avatar: getDeviceIcon(lock.lockType.toString()),
      name: lock.name,
      status: lock.status,
      location: lock.location || "N/A",
      macAddress: lock.macAddress,
      NotificationSnooze: lock.notificationSnooze,
      battery: `${lock.battery}%`,
      lockSettings: "Settings",
      lock: true,
    }));
  };

  const mapSafetyWearableCardsData = (cards) => {
    if (!cards?.devices || cards.devices.length === 0) return [];
    return cards.devices.map((card, index) => ({
      id: index + 1,
      avatar: safettyCardImg,
      name: card.name,
      status: card.status,
      location: card.location || "N/A",
      cellularNetwork: card.cellularNetwork || "N/A",
      macAddress: card.macAddress,
      battery: `${card.battery ? `${card.battery}%` : "N/A"}`,
      cardSettings: "Settings",
      safetyCard: true,
    }));
  };

  // Extract device data from API response or use example data as fallback
  // console.log("Devices data from API:", devicesData);
  const hubsData = mapHubsData(devicesData?.data?.hubs);
  const beaconsData = mapBeaconsData(devicesData?.data?.beacons);
  const connectedLocksData = mapConnectedLocksData(
    devicesData?.data?.connectedLocks,
  );
  const safetyWearableCardsData = mapSafetyWearableCardsData(
    devicesData?.data?.safetyWearableCards,
  );

  return (
    <DashboardLayout>
      <DashboardContent>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <PageTitle>{t("menu_devices")}</PageTitle>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                fontSize: "16px",
                fontWeight: "500",
                fontFamily: "'Decimal', sans-serif",
              }}
            >
              {t("devices_Filter")}:
            </span>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              style={{
                padding: "10px 16px",
                fontSize: "14px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                cursor: "pointer",
                fontFamily: "'Decimal', sans-serif",
                backgroundColor: "white",
                minWidth: "200px",
                color: "black",
              }}
            >
              <option value="All">{t("devices_All_Devices")}</option>
              <option value="Hubs">{t("devices_Hubs")}</option>
              <option value="Beacons">{t("devices_Beacons")}</option>
              <option value="Connected Locks">
                {t("devices_Connected_Locks")}
              </option>
              <option value="Safety Wearable Cards">
                {t("devices_Safety_Wearable_Cards")}
              </option>
            </select>
          </div>
        </div>

        {(selectedFilter === "All" || selectedFilter === "Hubs") && (
          <DataTable
            className="devices-table"
            title="devices_hubs"
            columns={HubsColumn}
            data={hubsData}
          />
        )}
        {(selectedFilter === "All" || selectedFilter === "Beacons") && (
          <DataTable
            className="devices-table"
            title="devices_beacons"
            columns={BeaconColumn}
            data={beaconsData}
          />
        )}
        {(selectedFilter === "All" || selectedFilter === "Connected Locks") && (
          <DataTable
            className="devices-table"
            title="devices_connected_locks"
            columns={ConnectedLocksColumn}
            data={connectedLocksData}
          />
        )}
        {(selectedFilter === "All" ||
          selectedFilter === "Safety Wearable Cards") && (
          <DataTable
            className="devices-table"
            title="devices_safety_wearable_cards"
            columns={SafetyWearableCardsColumn}
            data={safetyWearableCardsData}
            emptyMessage="Coming Soon"
            titleBadge="Coming Soon"
          />
        )}
      </DashboardContent>
    </DashboardLayout>
  );
};

export default Devices;
