import moment from "moment";

export const formatTime = (timestamp) => {
  return moment.utc(timestamp).local().format("hh:mm:ss A");
};

export const formatDate = (dateStamp) => {
  return moment.utc(dateStamp).local().format("DD MMM YYYY");
};
