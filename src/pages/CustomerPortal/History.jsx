import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { useUser } from "../../context/CustomerPortal/UserContext";
import {
  getAlertSummary,
  getDashboard,
  getDeviceHealth,
} from "../../api/CustomerPortal/DashboardApi";
import {
  getSafetyAlertIcon,
  getDeviceIcon,
  getSafetyAlertTranslationString,
  getSubcategoryTranslation,
} from "../../utility/CustomerPortal/DeviceMapping";
import { formatDateTime } from "../../utility/CustomerPortal/TimeFormat";
import { DashboardContent } from "../../styles/CustomerPortal/Dashboard.styled";
import DashboardLayout from "../../Layout/CustomerPortal/DashboardLayout";
import downloadImg from "../../assets/CustomerPortal/images/download.png";
import {
  HistoryContainer,
  HistoryHeader,
  HistoryTitle,
  FilterContainer,
  StatsGrid,
  CardsContainer,
  SummaryCard,
  CardTitle,
  CardContent,
  AlertList,
  AlertItem,
  AlertFilter,
  DownloadSection,
  ButtonGroup,
  DownloadButton,
} from "../../styles/CustomerPortal/History.styled";
import {
  DeviceHealthList,
  DeviceHealthItem,
  DeviceIcon,
  DeviceInfo,
  DeviceCount,
  DeviceName,
  DeviceStats,
  StatColumn,
  StatLabel,
  StatValue,
  StatTime,
} from "../../styles/CustomerPortal/SystemOverview.styled";
import StatCard from "../../components/CustomerPortal/StatCard/StatCard";
import SafetyImage from "../../assets/CustomerPortal/images/person-shield.png";
import SecurityImage from "../../assets/CustomerPortal/images/warningShield2.png";
import SystemImage from "../../assets/CustomerPortal/images/warning2.svg";
import OpenImage from "../../assets/CustomerPortal/images/openFolder2.png";
import AcknowledgeImage from "../../assets/CustomerPortal/images/Like.png";
import ResolvedImage from "../../assets/CustomerPortal/images/done2.png";
import { PageTitle } from "../../styles/CustomerPortal/SafetyNetwork.styled";
import { useTranslation } from "react-i18next";

const History = () => {
  const { user } = useUser();
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState("lastWeek");
  const [alertCategoryFilter, setAlertCategoryFilter] = useState("all");

  const handleFilterChange = (e) => {
    setSelectedFilter(e.target.value);
  };

  const handleAlertCategoryChange = (e) => {
    setAlertCategoryFilter(e.target.value);
  };

  // --- System Summary export helpers ---

  // Convert an image src (URL or data URL) to a base64 PNG string via canvas
  const loadImageAsBase64 = (src) =>
    new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;
        canvas.getContext("2d").drawImage(img, 0, 0, 32, 32);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });

  const getSystemSummaryRows = () =>
    deviceData.map((d) => ({
      Device: d.name,
      Total: d.count,
      Online: d.online,
      Offline: d.offline,
      Snooze: d.snooze,
    }));

  const downloadSystemSummaryPdf = async () => {
    const doc = new jsPDF();
    const dateStr = moment().format("YYYY-MM-DD");

    doc.setFontSize(14);
    doc.text("System Summary", 14, 16);
    doc.setFontSize(10);
    doc.text(`Generated: ${dateStr}`, 14, 23);

    const startX = 14;
    const TABLE_WIDTH = 168;
    const ROW_H = 14;
    const IMG_SIZE = 10;
    // columns: icon | Device | Total | Online | Offline | Snooze
    const cols = [
      { label: "", x: startX, w: 18 },
      { label: "Device", x: 34, w: 42 },
      { label: "Total", x: 78, w: 24 },
      { label: "Online", x: 104, w: 24 },
      { label: "Offline", x: 130, w: 24 },
      { label: "Snooze", x: 156, w: 26 },
    ];

    let y = 32;
    // Header row
    doc.setFillColor(0, 181, 226);
    doc.rect(startX, y, TABLE_WIDTH, ROW_H, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    cols.forEach((col) => {
      if (col.label) doc.text(col.label, col.x + 2, y + 9);
    });

    // Data rows
    doc.setTextColor(0, 0, 0);
    for (let ri = 0; ri < deviceData.length; ri++) {
      const device = deviceData[ri];
      y += ROW_H;
      if (ri % 2 === 1) {
        doc.setFillColor(240, 240, 240);
        doc.rect(startX, y, TABLE_WIDTH, ROW_H, "F");
      }
      // Embed device icon
      const b64 = await loadImageAsBase64(device.icon);
      if (b64) {
        doc.addImage(b64, "PNG", startX + 3, y + 2, IMG_SIZE, IMG_SIZE);
      }
      // Row text values
      const vals = [
        device.name,
        String(device.count),
        String(device.online),
        String(device.offline),
        String(device.snooze),
      ];
      cols.slice(1).forEach((col, i) => doc.text(vals[i], col.x + 2, y + 9));
    }

    doc.save(`system-summary-${dateStr}.pdf`);
  };

  const downloadSystemSummaryCsv = () => {
    // Note: CSV is plain text — image embedding is not supported by the format.
    const rows = getSystemSummaryRows();
    if (!rows.length) return;
    const columns = Object.keys(rows[0]);
    const csvLines = [
      columns.join(","),
      ...rows.map((r) =>
        columns
          .map((c) => `"${String(r[c] ?? "").replace(/"/g, '""')}"`)
          .join(","),
      ),
    ];
    const blob = new Blob([csvLines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `system-summary-${moment().format("YYYY-MM-DD")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSystemSummaryExcel = async () => {
    const wb = new ExcelJS.Workbook();
    wb.creator = "Ocufii";
    wb.created = new Date();
    const ws = wb.addWorksheet("System Summary");

    ws.columns = [
      { header: "", key: "icon", width: 5 },
      { header: "Device", key: "name", width: 22 },
      { header: "Total", key: "total", width: 10 },
      { header: "Online", key: "online", width: 10 },
      { header: "Offline", key: "offline", width: 10 },
      { header: "Snooze", key: "snooze", width: 10 },
    ];

    // Style header row
    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF00B5E2" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 20;

    for (let ri = 0; ri < deviceData.length; ri++) {
      const device = deviceData[ri];
      const row = ws.addRow({
        icon: "",
        name: device.name,
        total: device.count,
        online: device.online,
        offline: device.offline,
        snooze: device.snooze,
      });
      row.height = 30;
      row.alignment = { vertical: "middle" };

      // Alternating row background
      if (ri % 2 === 1) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF0F0F0" },
          };
        });
      }

      // Embed device icon in the first column
      const b64 = await loadImageAsBase64(device.icon);
      if (b64) {
        const base64Data = b64.replace(/^data:image\/\w+;base64,/, "");
        const imageId = wb.addImage({ base64: base64Data, extension: "png" });
        ws.addImage(imageId, {
          tl: { col: 0, row: ri + 1 },
          ext: { width: 24, height: 24 },
          editAs: "oneCell",
        });
      }
    }

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `system-summary-${moment().format("YYYY-MM-DD")}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- Alert Summary export helpers ---

  const getAlertSummaryRows = () =>
    filteredAlerts.map((alert) => ({
      Type: alert.type.charAt(0).toUpperCase() + alert.type.slice(1),
      Title:
        alert.type === "safety"
          ? t(getSafetyAlertTranslationString(alert.notificationReason))
          : alert.type === "security"
            ? t("txt_movement")
            : t(getSubcategoryTranslation(alert.notificationType)),
      Device: alert.title,
      Time: moment.utc(alert.duration).local().format("MMM D YYYY hh:mm:ss A"),
    }));

  const getAlertIconSrc = (alert) => {
    if (alert.type === "safety") {
      const iconData = getSafetyAlertIcon(alert.notificationReason);
      return iconData.type === "image" ? iconData.src : null;
    }
    return getDeviceIcon(alert.deviceType);
  };

  const downloadAlertSummaryPdf = async () => {
    const doc = new jsPDF({ orientation: "landscape" });
    const dateStr = moment().format("YYYY-MM-DD");

    doc.setFontSize(14);
    doc.text("Alert Summary", 14, 16);
    doc.setFontSize(10);
    doc.text(`Generated: ${dateStr}`, 14, 23);

    const startX = 14;
    const TABLE_WIDTH = 269;
    const ROW_H = 14;
    const IMG_SIZE = 10;
    const cols = [
      { label: "", x: startX, w: 18 },
      { label: "Type", x: 34, w: 24 },
      { label: "Title", x: 60, w: 80 },
      { label: "Device", x: 142, w: 75 },
      { label: "Time", x: 219, w: 64 },
    ];

    let y = 32;
    // Header row
    doc.setFillColor(0, 181, 226);
    doc.rect(startX, y, TABLE_WIDTH, ROW_H, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    cols.forEach((col) => {
      if (col.label) doc.text(col.label, col.x + 2, y + 9);
    });

    doc.setTextColor(0, 0, 0);
    for (let ri = 0; ri < filteredAlerts.length; ri++) {
      const alert = filteredAlerts[ri];
      y += ROW_H;
      if (y > 185) {
        doc.addPage();
        y = 20;
      }
      if (ri % 2 === 1) {
        doc.setFillColor(240, 240, 240);
        doc.rect(startX, y, TABLE_WIDTH, ROW_H, "F");
      }
      const iconSrc = getAlertIconSrc(alert);
      if (iconSrc) {
        const b64 = await loadImageAsBase64(iconSrc);
        if (b64)
          doc.addImage(b64, "PNG", startX + 3, y + 2, IMG_SIZE, IMG_SIZE);
      }
      const title =
        alert.type === "safety"
          ? t(getSafetyAlertTranslationString(alert.notificationReason))
          : alert.type === "security"
            ? t("txt_movement")
            : t(getSubcategoryTranslation(alert.notificationType));
      const vals = [
        alert.type.charAt(0).toUpperCase() + alert.type.slice(1),
        title,
        alert.title,
        moment.utc(alert.duration).local().format("MMM D YYYY hh:mm:ss A"),
      ];
      cols.slice(1).forEach((col, i) => {
        const text = doc.splitTextToSize(vals[i] || "", col.w - 4);
        doc.text(text[0] || "", col.x + 2, y + 9);
      });
    }

    doc.save(`alert-summary-${dateStr}.pdf`);
  };

  const downloadAlertSummaryCsv = () => {
    // Note: CSV is plain text — image embedding is not supported by the format.
    const rows = getAlertSummaryRows();
    if (!rows.length) return;
    const columns = Object.keys(rows[0]);
    const csvLines = [
      columns.join(","),
      ...rows.map((r) =>
        columns
          .map((c) => `"${String(r[c] ?? "").replace(/"/g, '""')}"`)
          .join(","),
      ),
    ];
    const blob = new Blob([csvLines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alert-summary-${moment().format("YYYY-MM-DD")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAlertSummaryExcel = async () => {
    const wb = new ExcelJS.Workbook();
    wb.creator = "Ocufii";
    wb.created = new Date();
    const ws = wb.addWorksheet("Alert Summary");

    ws.columns = [
      { header: "", key: "icon", width: 5 },
      { header: "Type", key: "type", width: 14 },
      { header: "Title", key: "title", width: 35 },
      { header: "Device", key: "device", width: 28 },
      { header: "Time", key: "time", width: 26 },
    ];

    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF00B5E2" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 20;

    for (let ri = 0; ri < filteredAlerts.length; ri++) {
      const alert = filteredAlerts[ri];
      const alertTitle =
        alert.type === "safety"
          ? t(getSafetyAlertTranslationString(alert.notificationReason))
          : alert.type === "security"
            ? t("txt_movement")
            : t(getSubcategoryTranslation(alert.notificationType));

      const row = ws.addRow({
        icon: "",
        type: alert.type.charAt(0).toUpperCase() + alert.type.slice(1),
        title: alertTitle,
        device: alert.title,
        time: moment
          .utc(alert.duration)
          .local()
          .format("MMM D YYYY hh:mm:ss A"),
      });
      row.height = 30;
      row.alignment = { vertical: "middle" };

      if (ri % 2 === 1) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF0F0F0" },
          };
        });
      }

      const iconSrc = getAlertIconSrc(alert);
      if (iconSrc) {
        const b64 = await loadImageAsBase64(iconSrc);
        if (b64) {
          const base64Data = b64.replace(/^data:image\/\w+;base64,/, "");
          const imageId = wb.addImage({ base64: base64Data, extension: "png" });
          ws.addImage(imageId, {
            tl: { col: 0, row: ri + 1 },
            ext: { width: 24, height: 24 },
            editAs: "oneCell",
          });
        }
      }
    }

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alert-summary-${moment().format("YYYY-MM-DD")}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Fetch dashboard data with date range
  const { data: dashboardData } = useQuery({
    queryKey: ["dashboardHistory", user?.email, selectedFilter],
    queryFn: () => getDashboard(user?.email || "", 1000, selectedFilter),
    enabled: !!user?.email,
    refetchInterval: 5000, // Refetch every 5 seconds
    retry: 1,
  });

  // TanStack Query for alert summary with dynamic time range
  const { data: alertSummaryApiData } = useQuery({
    queryKey: ["alertSummary", user?.email, selectedFilter],
    queryFn: () => {
      const endDateTime = moment().toISOString();
      let startDateTime;

      if (selectedFilter === "lastMonth") {
        startDateTime = moment().subtract(1, "month").toISOString();
      } else if (selectedFilter === "last3Months") {
        startDateTime = moment().subtract(3, "months").toISOString();
      } else {
        // Default to lastWeek
        startDateTime = moment().subtract(7, "days").toISOString();
      }

      return getAlertSummary(user?.email, startDateTime, endDateTime);
    },
    enabled: !!user?.email,
    refetchInterval: 60000, // Refetch every 1 minute
    staleTime: 60000, // Cache for 1 minute
    retry: 1,
  });

  // TanStack Query for device health
  const { data: deviceHealthApiData } = useQuery({
    queryKey: ["deviceHealth", user?.email],
    queryFn: () => getDeviceHealth(user?.email),
    enabled: !!user?.email,
    refetchInterval: 60000, // Refetch every 1 minute
    staleTime: 60000, // Cache for 1 minute
    retry: 1,
  });

  // Transform device health API data
  const deviceData = useMemo(() => {
    return (deviceHealthApiData?.data || []).map((device) => ({
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
  }, [deviceHealthApiData]);

  // Stats data based on selected filter
  const statsData = useMemo(
    () => [
      {
        id: 1,
        title: "Safety",
        value: alertSummaryApiData?.data?.safetyCount || 0,
        image: SafetyImage,
      },
      {
        id: 2,
        title: "Security",
        value: alertSummaryApiData?.data?.securityCount || 0,
        image: SecurityImage,
      },
      {
        id: 3,
        title: "System",
        value: alertSummaryApiData?.data?.systemCount || 0,
        image: SystemImage,
      },
      {
        id: 4,
        title: "Open",
        value:
          (alertSummaryApiData?.data?.safetyAlerts?.open || 0) +
          (alertSummaryApiData?.data?.securityAlerts?.open || 0) +
          (alertSummaryApiData?.data?.systemAlerts?.open || 0),
        image: OpenImage,
      },
      {
        id: 5,
        title: "Acknowledged",
        value:
          (alertSummaryApiData?.data?.safetyAlerts?.acknowledged || 0) +
          (alertSummaryApiData?.data?.securityAlerts?.acknowledged || 0) +
          (alertSummaryApiData?.data?.systemAlerts?.acknowledged || 0),
        image: AcknowledgeImage,
      },
      {
        id: 6,
        title: "Resolved",
        value:
          (alertSummaryApiData?.data?.safetyAlerts?.resolved || 0) +
          (alertSummaryApiData?.data?.securityAlerts?.resolved || 0) +
          (alertSummaryApiData?.data?.systemAlerts?.resolved || 0),
        image: ResolvedImage,
      },
    ],
    [alertSummaryApiData],
  );

  // Combine all alerts from safety, security, and system
  const allAlerts = useMemo(() => {
    const safetyAlerts = dashboardData?.data?.safety?.alerts || [];
    const securityAlerts = dashboardData?.data?.security?.alerts || [];
    const systemAlerts = dashboardData?.data?.system?.alerts || [];

    return [...safetyAlerts, ...securityAlerts, ...systemAlerts].sort(
      (a, b) => new Date(b.duration) - new Date(a.duration),
    );
  }, [dashboardData]);

  // Filter alerts based on category
  const filteredAlerts = useMemo(() => {
    if (alertCategoryFilter === "all") {
      return allAlerts;
    }
    return allAlerts.filter((alert) => alert.type === alertCategoryFilter);
  }, [allAlerts, alertCategoryFilter]);

  return (
    <DashboardLayout>
      <DashboardContent>
        <HistoryContainer>
          <HistoryHeader>
            <PageTitle>{t("menu_history")}</PageTitle>
            <FilterContainer>
              <label htmlFor="history-filter">{t("devices_Filter")}:</label>
              <select
                id="history-filter"
                className="filter-dropdown"
                value={selectedFilter}
                onChange={handleFilterChange}
              >
                <option value="lastWeek">{t("history_Last_Week")}</option>
                <option value="lastMonth">{t("history_Last_Month")}</option>
                <option value="last3Months">
                  {t("history_Last_3_Months")}
                </option>
              </select>
            </FilterContainer>
          </HistoryHeader>

          <StatsGrid>
            {statsData.map((stat) => (
              <StatCard
                key={stat.id}
                image={stat.image}
                title={stat.title}
                value={stat.value}
              />
            ))}
          </StatsGrid>

          <CardsContainer>
            {/* System Summary Card */}
            <SummaryCard>
              <CardTitle>{t("txt_system_summary")}</CardTitle>
              <CardContent>
                <DeviceHealthList>
                  {deviceData.map((device, index) => (
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
                          <StatValue $status="online">
                            {device.online}
                          </StatValue>
                        </StatColumn>
                        <StatColumn>
                          <StatLabel>{t("dashboard_Offline")}</StatLabel>
                          <StatValue $status="offline">
                            {device.offline}
                          </StatValue>
                          <StatTime>{device.offlineTime}</StatTime>
                        </StatColumn>
                        <StatColumn>
                          <StatLabel>{t("dashboard_Snooze")}</StatLabel>
                          <StatValue $status="snooze">
                            {device.snooze}
                          </StatValue>
                        </StatColumn>
                      </DeviceStats>
                    </DeviceHealthItem>
                  ))}
                </DeviceHealthList>

                <DownloadSection>
                  <p>{t("history_Download_System_Summary")}</p>
                  <ButtonGroup>
                    <DownloadButton onClick={downloadSystemSummaryPdf}>
                      <img
                        src={downloadImg}
                        alt="download"
                        style={{ width: 18, height: 18, marginRight: 8 }}
                      />
                      PDF
                    </DownloadButton>
                    <DownloadButton onClick={downloadSystemSummaryCsv}>
                      <img
                        src={downloadImg}
                        alt="download"
                        style={{ width: 18, height: 18, marginRight: 8 }}
                      />
                      CSV
                    </DownloadButton>
                    <DownloadButton onClick={downloadSystemSummaryExcel}>
                      <img
                        src={downloadImg}
                        alt="download"
                        style={{ width: 18, height: 18, marginRight: 8 }}
                      />
                      EXCEL
                    </DownloadButton>
                  </ButtonGroup>
                </DownloadSection>
              </CardContent>
            </SummaryCard>

            {/* Alert Summary Card */}
            <SummaryCard>
              <CardTitle>{t("dashboard_Alert_Summary")}</CardTitle>
              <CardContent>
                <AlertFilter>
                  <label>{t("devices_Filter")}:</label>
                  <select
                    value={alertCategoryFilter}
                    onChange={handleAlertCategoryChange}
                  >
                    <option value="all">{t("dashboard_All_Alerts")}</option>
                    <option value="safety">{t("txt_safety_alerts")}</option>
                    <option value="security">
                      {t("dashboard_Security_Alerts")}
                    </option>
                    <option value="system">
                      {t("dashboard_System_Alerts")}
                    </option>
                  </select>
                </AlertFilter>

                <AlertList style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {filteredAlerts.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "40px 20px",
                        color: "#666",
                      }}
                    >
                      {t("txt_no_alert")}
                    </div>
                  ) : (
                    filteredAlerts.map((alert) => {
                      // Get appropriate icon based on alert type
                      let iconElement;
                      if (alert.type === "safety") {
                        const iconData = getSafetyAlertIcon(
                          alert.notificationReason,
                        );
                        if (iconData.type === "image") {
                          iconElement = (
                            <img
                              src={iconData.src}
                              alt={iconData.alt}
                              style={{ width: "40px", height: "40px" }}
                            />
                          );
                        } else {
                          const IconComponent = iconData.Component;
                          iconElement = (
                            <IconComponent
                              style={{ fontSize: "40px", color: "#00B5E2" }}
                            />
                          );
                        }
                      } else {
                        // Security or System alert - use device icon
                        iconElement = (
                          <img
                            src={getDeviceIcon(alert.deviceType)}
                            alt="Device"
                            style={{ width: "40px", height: "40px" }}
                          />
                        );
                      }

                      return (
                        <AlertItem key={alert.id}>
                          {iconElement}
                          <div className="alert-info">
                            <div className="alert-title">
                              {alert.type === "safety"
                                ? t(
                                    getSafetyAlertTranslationString(
                                      alert.notificationReason,
                                    ),
                                  )
                                : alert.type === "security"
                                  ? t("txt_movement")
                                  : t(
                                      getSubcategoryTranslation(
                                        alert.notificationType,
                                      ),
                                    )}
                            </div>
                            <div className="alert-device">{alert.title}</div>
                          </div>
                          <div className="alert-time">
                            {moment
                              .utc(alert.duration)
                              .local()
                              .format("MMM D YYYY hh:mm:ss A")}
                          </div>
                        </AlertItem>
                      );
                    })
                  )}
                </AlertList>

                <DownloadSection>
                  <p>{t("history_Download_Alert_Histories")}</p>
                  <ButtonGroup>
                    <DownloadButton onClick={downloadAlertSummaryPdf}>
                      <img
                        src={downloadImg}
                        alt="download"
                        style={{ width: 18, height: 18, marginRight: 8 }}
                      />
                      PDF
                    </DownloadButton>
                    <DownloadButton onClick={downloadAlertSummaryCsv}>
                      <img
                        src={downloadImg}
                        alt="download"
                        style={{ width: 18, height: 18, marginRight: 8 }}
                      />
                      CSV
                    </DownloadButton>
                    <DownloadButton onClick={downloadAlertSummaryExcel}>
                      <img
                        src={downloadImg}
                        alt="download"
                        style={{ width: 18, height: 18, marginRight: 8 }}
                      />
                      EXCEL
                    </DownloadButton>
                  </ButtonGroup>
                </DownloadSection>
              </CardContent>
            </SummaryCard>
          </CardsContainer>
        </HistoryContainer>
      </DashboardContent>
    </DashboardLayout>
  );
};

export default History;
