import { MdBatteryAlert, MdSignalWifiOff } from "react-icons/md";
import gunTriggerLock from "../../assets/CustomerPortal/images/gun_trigger_lock.png";
import beaconImg from "../../assets/CustomerPortal/images/beacon.png";
import wifiHubImg from "../../assets/CustomerPortal/images/baseStation.png";
import flexibandImg from "../../assets/CustomerPortal/images/flexiband.png";
import lockBeaconImg from "../../assets/CustomerPortal/images/lockbeacon.png";
import slideLockImg from "../../assets/CustomerPortal/images/bosLock.svg";
import safetyCardImg from "../../assets/CustomerPortal/images/safety_card2.png";
import warningImg from "../../assets/CustomerPortal/images/warning2.svg";

import dialImg from "../../assets/CustomerPortal/images/988.png";
import emergenecyImg from "../../assets/CustomerPortal/images/alarm-bell-ring-2.svg";
import emergenecyImg2 from "../../assets/CustomerPortal/images/alarm-bell-3.png";
import { GiColtM1911 } from "react-icons/gi";
import { MdOutlineEmergency, MdSentimentDissatisfied } from "react-icons/md";
import { GiPistolGun } from "react-icons/gi";
import autoDialImg from "../../assets/CustomerPortal/images/988-3.png";
import autoDialImgBlack from "../../assets/CustomerPortal/images/988-2.png";
import autoDial911 from "../../assets/CustomerPortal/images/Safety-911-2.png";
import autoDial911Black from "../../assets/CustomerPortal/images/Safety-911-3.png";
import activeShooterImg from "../../assets/CustomerPortal/images/active-shooter.svg";
import activeShooterBlackImg from "../../assets/CustomerPortal/images/gun-black.png";
import feelingUnsafeImg from "../../assets/CustomerPortal/images/feeling-unsafe.svg";
import feelingUnsafeBlackImg from "../../assets/CustomerPortal/images/feeling-unsafe-black.png";

export const getDeviceIcon = (deviceType) => {
  switch (deviceType) {
    case "0":
    case "2":
    case "03":
      return beaconImg;
    case "1":
      return wifiHubImg;
    case "3":
      return flexibandImg;
    case "4":
      return lockBeaconImg;
    case "5":
      return gunTriggerLock;
    case "6":
      return slideLockImg;
    case "7":
      return safetyCardImg;
    default:
      return warningImg;
  }
};

export const getSafetyAlertIcon = (notificationReason, isFromMap = false) => {
  switch (notificationReason) {
    case "Emergency Alert":
    case "Emergency Alert Canceled":
      return {
        type: "image",
        src: isFromMap ? emergenecyImg2 : emergenecyImg,
        alt: "Emergency Alert",
      };

    case "Feeling Unsafe":
    case "Feeling Unsafe Alert":
    case "Feeling Unsafe Alert Canceled":
      return {
        type: "image",
        src: isFromMap ? feelingUnsafeBlackImg : feelingUnsafeImg,
        alt: "Feeling Unsafe Alert",
      };
    case "Active Shooter":
    case "Active Shooter Alert":
    case "Active Shooter Alert Canceled":
      return {
        type: "image",
        src: isFromMap ? activeShooterBlackImg : activeShooterImg,
        alt: "Active Shooter Alert",
      };
    case "Auto-Dial 911 Alert":
    case "Auto-Dial 911 Alert Canceled":
      return {
        type: "image",
        src: isFromMap ? autoDial911Black : autoDial911,
        alt: "Auto-Dial 911 Alert",
      };
    case "Auto-Dial 988 Alert Canceled":
    case "Auto-Dial 988 Alert":
      return {
        type: "image",
        src: isFromMap ? autoDialImgBlack : autoDialImg,
        alt: "Auto-Dial 988 Alert",
      };
    default:
      return { type: "icon", Component: MdOutlineEmergency };
  }
};

export const getUserStatusLabel = (userStatus) => {
  switch (userStatus) {
    case 0:
      return "PENDING";
    case 1:
      return "LINKED";
    case 2:
      return "REJECTED";
    case 3:
      return "BLOCKED";
    case 4:
      return "NOT LINKED";
    case 5:
      return "SNOOZED";
    case 6:
      return "DELETED";
    default:
      return "NOT LINKED";
  }
};

export const getSafetyAlertTranslationString = (notificationReason) => {
  switch (notificationReason) {
    case "Emergency Alert":
      return "dashboard_Emergency_Alert";
    case "Emergency Alert Canceled":
      return "dashboard_Emergency_Alert_Canceled";

    case "Feeling Unsafe":
      return "txt_feeling_unsafe";
    case "Feeling Unsafe Alert":
      return "dashboard_Feeling_Unsafe_Alert";
    case "Feeling Unsafe Alert Canceled":
      return "dashboard_Feeling_Unsafe_Canceled";
    case "Active Shooter":
      return "txt_active_shooter";
    case "Active Shooter Alert":
      return "dashboard_Active_Shooter_Alert";
    case "Active Shooter Alert Canceled":
      return "dashboard_Active_Shooter_Canceled";
    case "Auto-Dial 911 Alert":
      return "txt_911";
    case "Auto-Dial 911 Alert Canceled":
      return "txt_911_canceled";
    case "Auto-Dial 988 Alert Canceled":
      return "txt_988_canceled";
    case "Auto-Dial 988 Alert":
      return "txt_988";
    default:
      return "";
  }
};

export const getSubcategoryTranslation = (notificationType) => {
  switch (notificationType) {
    case "1":
      return "txt_low_battery";
    case "4":
      return "txt_beacon_offline";
    case "5":
      return "txt_beacon_online";
    case "6":
      return "txt_wifi_offline";
    case "7":
      return "txt_wifi_online";
    case "8":
      return "txt_safety_card_offline";
    case "9":
      return "txt_safety_card_online";
    case "10":
      return "txt_safety_card_battery_low";
    case "11":
      return "txt_safety_sos";
    default:
      return "txt_default_alert";
  }
};
