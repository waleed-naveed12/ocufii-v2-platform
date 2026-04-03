import React, { useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { AlertsChartContainer } from "../../../styles/CustomerPortal/Dashboard.styled";
import moment from "moment";
import "moment/locale/es"; // Import Spanish locale for moment
import { useQuery } from "@tanstack/react-query";
import { useUser } from "../../../context/CustomerPortal/UserContext";
import { getDashboard } from "../../../api/CustomerPortal/DashboardApi";
import ColorCircle from "../ColorCircle";
import {
  CustomDropdown,
  CustomDropdownButton,
  CustomDropdownMenu,
  CustomDropdownItem,
} from "../../../styles/CustomerPortal/Alert.styled";
import { useTranslation } from "react-i18next";

// Spanish month names for manual translation (moment locale not reliable)
const spanishMonths = {
  Jan: "ene.",
  Feb: "feb.",
  Mar: "mar.",
  Apr: "abr.",
  May: "may.",
  Jun: "jun.",
  Jul: "jul.",
  Aug: "ago.",
  Sep: "sep.",
  Oct: "oct.",
  Nov: "nov.",
  Dec: "dic.",
};

// Helper function to translate month names
const translateMonth = (dateStr, toSpanish) => {
  if (!toSpanish) return dateStr;

  let result = dateStr;
  Object.entries(spanishMonths).forEach(([eng, esp]) => {
    result = result.replace(eng, esp);
  });
  return result;
};

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const AlertsChart = () => {
  const { user } = useUser();
  const { t, i18n } = useTranslation();
  const [selectedType, setSelectedType] = useState("total");
  const [selectedRange, setSelectedRange] = useState("15days");
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  // Fetch dashboard data for chart
  const { data: apiData } = useQuery({
    queryKey: ["dashboard-chart", user?.email, selectedRange],
    queryFn: () => getDashboard(user?.email || "", 1000, selectedRange),
    enabled: !!user?.email,
    refetchInterval: 120000, // Refetch every 2 minutes
  });

  // Extract alerts from API response
  const safetyAlerts = apiData?.data?.safety?.alerts || [];
  const securityAlerts = apiData?.data?.security?.alerts || [];
  const systemAlerts = apiData?.data?.system?.alerts || [];

  // Process alerts data based on selected filters
  const chartData = useMemo(() => {
    // Check if current language is Spanish
    const isSpanish = i18n.language?.split("-")[0] === "es";

    // Generate labels based on date range
    const daysCount =
      selectedRange === "24hours"
        ? 1
        : selectedRange === "7days"
          ? 7
          : selectedRange === "15days"
            ? 15
            : 30;

    const labels = [];
    const dayKeys = [];
    for (let i = daysCount - 1; i >= 0; i--) {
      const day = moment().subtract(i, "days");
      const englishDate = day.format("MMM D");
      labels.push(translateMonth(englishDate, isSpanish));
      dayKeys.push(day.format("YYYY-MM-DD"));
    }

    // Count alerts per day by matching alert.duration to each day label
    const countByDay = (alertsArray) => {
      return dayKeys.map(
        (day) =>
          alertsArray.filter(
            (alert) => moment(alert.duration).format("YYYY-MM-DD") === day,
          ).length,
      );
    };

    if (selectedType === "total") {
      // Return datasets for all three types
      return {
        labels,
        datasets: [
          {
            label: t("dashboard_Safety"),
            data: countByDay(safetyAlerts),
            borderColor: "rgba(0, 181, 226, 1)",
            backgroundColor: "rgba(0, 181, 226, 0.1)",
          },
          {
            label: t("dashboard_Security"),
            data: countByDay(securityAlerts),
            borderColor: "rgba(225, 6, 0, 1)",
            backgroundColor: "rgba(225, 6, 0, 0.1)",
          },
          {
            label: t("dashboard_System"),
            data: countByDay(systemAlerts),
            borderColor: "rgba(255, 248, 40, 1)",
            backgroundColor: "rgba(255, 248, 40, 0.1)",
          },
        ],
      };
    } else {
      // Return single dataset for selected type
      let alertsToUse = [];
      let color = {};
      switch (selectedType) {
        case "safety":
          alertsToUse = safetyAlerts;
          color = {
            borderColor: "rgba(0, 181, 226, 1)",
            backgroundColor: "rgba(0, 181, 226, 0.1)",
          };
          break;
        case "security":
          alertsToUse = securityAlerts;
          color = {
            borderColor: "rgba(225, 6, 0, 1)",
            backgroundColor: "rgba(225, 6, 0, 0.1)",
          };
          break;
        case "system":
          alertsToUse = systemAlerts;
          color = {
            borderColor: "rgba(255, 248, 40, 1)",
            backgroundColor: "rgba(255, 248, 40, 0.1)",
          };
          break;
      }

      return {
        labels,
        datasets: [
          {
            label: t("dashboard_Alerts"),
            data: countByDay(alertsToUse),
            ...color,
          },
        ],
      };
    }
  }, [
    selectedType,
    selectedRange,
    i18n.language,
    safetyAlerts,
    securityAlerts,
    systemAlerts,
  ]);

  const data = {
    labels: chartData.labels,
    datasets: chartData.datasets.map((dataset) => ({
      ...dataset,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: dataset.borderColor,
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: selectedType === "total",
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleColor: "#fff",
        bodyColor: "#fff",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          color: "#666",
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          color: "#666",
          font: {
            size: 12,
          },
          stepSize: 5,
        },
      },
    },
  };

  return (
    <AlertsChartContainer>
      <div className="chart-header">
        <h2>{t("txt_alert_trends")}</h2>
        <div>
          <CustomDropdown>
            <CustomDropdownButton
              onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
            >
              {selectedType === "total" && t("dashboard_Total_Alerts")}
              {selectedType === "safety" && t("dashboard_Safety")}
              {selectedType === "security" && t("dashboard_Security")}
              {selectedType === "system" && t("dashboard_System")}
            </CustomDropdownButton>
            {isTypeDropdownOpen && (
              <CustomDropdownMenu>
                <CustomDropdownItem
                  $selected={selectedType === "total"}
                  onClick={() => {
                    setSelectedType("total");
                    setIsTypeDropdownOpen(false);
                  }}
                >
                  <span>{t("dashboard_Total_Alerts")}</span>
                </CustomDropdownItem>
                <CustomDropdownItem
                  $selected={selectedType === "safety"}
                  onClick={() => {
                    setSelectedType("safety");
                    setIsTypeDropdownOpen(false);
                  }}
                >
                  <ColorCircle color="rgba(0, 181, 226, 1)" />
                  <span>{t("dashboard_Safety")}</span>
                </CustomDropdownItem>
                <CustomDropdownItem
                  $selected={selectedType === "security"}
                  onClick={() => {
                    setSelectedType("security");
                    setIsTypeDropdownOpen(false);
                  }}
                >
                  <ColorCircle color="rgba(225, 6, 0, 1)" />
                  <span>{t("dashboard_Security")}</span>
                </CustomDropdownItem>
                <CustomDropdownItem
                  $selected={selectedType === "system"}
                  onClick={() => {
                    setSelectedType("system");
                    setIsTypeDropdownOpen(false);
                  }}
                >
                  <ColorCircle color="rgba(255, 248, 40, 1)" />
                  <span>{t("dashboard_System")}</span>
                </CustomDropdownItem>
              </CustomDropdownMenu>
            )}
          </CustomDropdown>
          <select
            className="month-selector"
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
          >
            <option value="24hours">{t("txt_today")}</option>
            <option value="7days">{t("text_7")}</option>
            <option value="15days">{t("txt_15")}</option>
            <option value="30days">{t("text_30")}</option>
          </select>
        </div>
      </div>
      <div className="chart-wrapper">
        <Line data={data} options={options} />
      </div>
    </AlertsChartContainer>
  );
};

export default AlertsChart;
