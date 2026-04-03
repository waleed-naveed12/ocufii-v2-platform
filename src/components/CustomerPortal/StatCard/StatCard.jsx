import React from "react";
import styled from "styled-components";
import {
  CardContainer,
  CardHeader,
  IconWrapper,
  CardTitle,
  CardValue,
} from "../../../styles/CustomerPortal/StatsCard.styled";
import { useTranslation } from "react-i18next";

const StatCard = ({ image, title, value, color, onClick }) => {
  const { t } = useTranslation();
  return (
    <CardContainer onClick={onClick}>
      <CardHeader>
        <IconWrapper>{image && <img src={image} alt={title} />}</IconWrapper>
        <CardTitle>{t(`dashboard_${title}`)}</CardTitle>
      </CardHeader>
      <CardValue>{value}</CardValue>
    </CardContainer>
  );
};

export default StatCard;
