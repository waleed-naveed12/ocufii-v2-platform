import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TableContainer,
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  StatusBadge,
  AvatarWrapper,
  Avatar,
  StatusIndicator,
  SettingsButton,
} from "../../../styles/CustomerPortal/Table.styled";
import { ROUTE } from "../../../common/CustomerPortal/Routes";
import { IoIosArrowDropdown } from "react-icons/io";
import { IoIosArrowDropup } from "react-icons/io";
import { useTranslation } from "react-i18next";

const DataTable = ({
  columns,
  data,
  title,
  clientInfo,
  className,
  size,
  emptyMessage,
  titleBadge,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "online":
      case "active":
        return "online";
      case "offline":
      case "inactive":
        return "offline";
      case "snooze":
      case "snoozed":
        return "snoozed";
      default:
        return "default";
    }
  };

  const handleSettingsClick = (item) => {
    // console.log("Navigating to device details for item:", item);
    navigate(ROUTE.DEVICEDETAILS, { state: { device: item } });
  };

  const renderCellContent = (item, column) => {
    const value = item[column.key];

    if (column.key === "avatar") {
      return (
        <AvatarWrapper>
          <Avatar src={value} alt={item.name} />
          <StatusIndicator status={item.status?.toLowerCase()} />
        </AvatarWrapper>
      );
    }

    if (column.key === "status" || column.key === "beaconStatus") {
      return (
        <StatusBadge status={getStatusColor(value)}>
          {t(`dashboard_${value}`)}
        </StatusBadge>
      );
    }

    if (column.key === "NotificationSnooze") {
      const snoozeStatus =
        value?.toLowerCase() === "enabled" ? "online" : "offline";
      return (
        <StatusBadge status={snoozeStatus}>
          {t(`dashboard_${value}`)}
        </StatusBadge>
      );
    }

    // Render Settings button for any column ending with "Settings"
    if (column.key.endsWith("Settings")) {
      return (
        <SettingsButton onClick={() => handleSettingsClick(item)}>
          {t("devices_Settings")}
        </SettingsButton>
      );
    }

    return value;
  };

  return (
    <TableContainer className={className}>
      {title && (
        <div
          className="table-header"
          onClick={toggleCollapse}
          style={{ cursor: "pointer" }}
        >
          <h2 className="table-title">
            <span
              style={{
                marginRight: "12px",
                display: "inline-flex",
                alignItems: "center",
                transition: "transform 0.3s ease",
              }}
            >
              {isCollapsed ? (
                <IoIosArrowDropup size={20} />
              ) : (
                <IoIosArrowDropdown size={20} />
              )}
            </span>
            {t(title)}
            <span className="count-badge">{data.length}</span>
            {titleBadge && (
              <span
                style={{
                  marginLeft: "10px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#F7941D",
                  background: "rgba(247,148,29,0.12)",
                  border: "1px solid rgba(247,148,29,0.4)",
                  borderRadius: "20px",
                  padding: "2px 10px",
                  letterSpacing: "0.4px",
                }}
              >
                {titleBadge}
              </span>
            )}
          </h2>
        </div>
      )}

      <div
        className="table-wrapper"
        style={{
          maxHeight: isCollapsed ? "0" : "2000px",
          overflow: "hidden",
          transition: "max-height 0.3s ease-in-out",
          opacity: isCollapsed ? "0" : "1",
        }}
      >
        {data.length === 0 ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "40px 20px",
              fontSize: "16px",
              color: "#666",
              fontFamily: "'Decimal', sans-serif",
            }}
          >
            {emptyMessage ?? t("devices_No_Records")}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHeaderCell key={column.key}>
                    {t(column.title)}
                  </TableHeaderCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={item.id || index}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {renderCellContent(item, column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </TableContainer>
  );
};

export default DataTable;
