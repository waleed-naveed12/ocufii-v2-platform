import React, { useState } from "react";
import styled from "styled-components";
import PrimaryButton from "../Button/PrimaryButton";
import NoLocationModal from "../NoLocationModal";
import { IoIosArrowDropdown, IoIosArrowDropup } from "react-icons/io";
import {
  TableContainer,
  TableHeader,
  HeaderIcon,
  TitleWrapper,
  TableTitle,
  CountBadge,
  StyledTable,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableCell,
  AlertCell,
  PaginationWrapper,
  PaginationInfo,
  PaginationControls,
  PageInfo,
  PaginationButton,
} from "../../../styles/CustomerPortal/AlertTable.styled";
import { useTranslation } from "react-i18next";
import { StatusBadge } from "../../../styles/CustomerPortal/Table.styled";

const AlertTable = ({
  icon,
  title,
  count,
  headerColor = "#dc3545",
  data = [],
  onAction,
  onView,
  actionButtonText = "Alert Action",
  actionButtonColor = "#007bff",
  showActionButton = true,
}) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [showNoLocationModal, setShowNoLocationModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const itemsPerPage = 10;

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Calculate pagination
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  // Reset to page 1 when data changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const renderAlertIcon = (alertIcon) => {
    if (typeof alertIcon === "object" && alertIcon !== null) {
      if (alertIcon.type === "image") {
        return (
          <img
            src={alertIcon.src}
            alt={alertIcon.alt}
            style={{ width: "24px", height: "24px" }}
          />
        );
      } else if (alertIcon.type === "icon" && alertIcon.Component) {
        const IconComponent = alertIcon.Component;
        return (
          <IconComponent
            style={{ fontSize: "24px" }}
            color="rgba(0, 181, 226, 1)"
          />
        );
      }
    }

    // Check if it's a string that's an image path or data URI
    if (typeof alertIcon === "string") {
      // Check if it's a data URI (starts with data:image/)
      const isDataURI = alertIcon.startsWith("data:image/");

      // Check if it's a regular image path
      const imageExtensions = [
        ".png",
        ".jpg",
        ".jpeg",
        ".svg",
        ".gif",
        ".webp",
      ];
      const isImagePath = imageExtensions.some((ext) =>
        alertIcon.toLowerCase().includes(ext),
      );

      if (isDataURI || isImagePath) {
        return (
          <img
            src={alertIcon}
            alt="Alert Icon"
            style={{ width: "24px", height: "24px", objectFit: "contain" }}
          />
        );
      }
    }

    return alertIcon; // Return string emojis as-is
  };

  return (
    <TableContainer>
      <TableHeader onClick={toggleCollapse} style={{ cursor: "pointer" }}>
        <HeaderIcon>
          <img src={icon} alt={title} />
        </HeaderIcon>
        <TitleWrapper>
          <TableTitle>{t(title)}</TableTitle>
          <CountBadge $bgColor={headerColor}>{count}</CountBadge>
        </TitleWrapper>
        <span
          style={{
            marginLeft: "auto",
            display: "inline-flex",
            alignItems: "center",
            transition: "transform 0.3s ease",
          }}
        >
          {isCollapsed ? (
            <IoIosArrowDropup size={24} />
          ) : (
            <IoIosArrowDropdown size={24} />
          )}
        </span>
      </TableHeader>

      <div
        style={{
          maxHeight: isCollapsed ? "0" : "2000px",
          overflow: "hidden",
          transition: "max-height 0.3s ease-in-out, opacity 0.3s ease-in-out",
          opacity: isCollapsed ? "0" : "1",
        }}
      >
        <StyledTable>
          <TableHead>
            <TableRow>
              <TableHeaderCell>{t("dashboard_Sender")}</TableHeaderCell>
              <TableHeaderCell>{t("txt_alert")}</TableHeaderCell>
              <TableHeaderCell>{t("dashboard_Time")}</TableHeaderCell>
              <TableHeaderCell>{t("dashboard_Date")}</TableHeaderCell>
              {showActionButton && (
                <TableHeaderCell>
                  {t("dashboard_Action_Button")}
                </TableHeaderCell>
              )}
            </TableRow>
          </TableHead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.sender}</TableCell>
                  <AlertCell>
                    {/* <span className="alert-icon">
                      {renderAlertIcon(row.alertIcon)}
                    </span> */}
                    {(() => {
                      const text = row.alert || "";
                      const lowerText = text.toLowerCase();
                      if (lowerText.includes("online") && !lowerText.includes("offline")) {
                        return <StatusBadge status="online">Online</StatusBadge>;
                      } else if (lowerText.includes("offline")) {
                        return <StatusBadge status="offline">Offline</StatusBadge>;
                      }
                      return <span>{text}</span>;
                    })()}
                  </AlertCell>
                  <TableCell>{row.time}</TableCell>
                  <TableCell>{row.date}</TableCell>
                  {showActionButton && (
                    <TableCell>
                      <div style={{ display: "flex", gap: "12px" }}>
                        {onView && (
                          <PrimaryButton
                            size="small"
                            color={actionButtonColor}
                            onClick={() => {
                              const hasValidLocation =
                                row.lat &&
                                row.lng &&
                                row.lat !== "" &&
                                row.lng !== "";
                              if (!hasValidLocation) {
                                setShowNoLocationModal(true);
                              } else {
                                onView && onView(row, startIndex + index);
                              }
                            }}
                          >
                            {t("txt_view")}
                          </PrimaryButton>
                        )}
                        <PrimaryButton
                          size="small"
                          color={actionButtonColor}
                          onClick={() =>
                            onAction && onAction(row, startIndex + index)
                          }
                        >
                          {t(actionButtonText)}
                        </PrimaryButton>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={showActionButton ? 5 : 4}
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  {t("dashboard_No_Alerts_Available")}
                </TableCell>
              </TableRow>
            )}
          </tbody>
        </StyledTable>

        {data.length > itemsPerPage && (
          <PaginationWrapper>
            <PaginationInfo>
              {t("txt_showing")} {startIndex + 1} {t("txt_to")}{" "}
              {Math.min(endIndex, data.length)} {t("txt_of")} {data.length}{" "}
              {t("txt_entries")}
            </PaginationInfo>
            <PaginationControls>
              <PaginationButton
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                {t("txt_previous")}
              </PaginationButton>
              <PageInfo>
                {t("txt_page")} {currentPage} {t("txt_of")} {totalPages}
              </PageInfo>
              <PaginationButton
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                {t("txt_next")}
              </PaginationButton>
            </PaginationControls>
          </PaginationWrapper>
        )}
      </div>

      <NoLocationModal
        isOpen={showNoLocationModal}
        onClose={() => setShowNoLocationModal(false)}
      />
    </TableContainer>
  );
};

export default AlertTable;
