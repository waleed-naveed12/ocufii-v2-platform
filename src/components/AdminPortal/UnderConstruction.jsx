import React from "react";
import { FiTool, FiClock } from "react-icons/fi";
import { UnderConstructionStyled } from "../../styles/AdminPortal/UnderConstruction.styled";

const UnderConstruction = ({ title, message, showIcon = true }) => {
  return (
    <UnderConstructionStyled>
      <div className="construction-container">
        {showIcon && (
          <div className="icon-container">
            <FiTool className="tool-icon" />
            <FiClock className="clock-icon" />
          </div>
        )}
        <h2 className="construction-title">
          {title || "Page Under Construction"}
        </h2>
        <p className="construction-message">
          {message || "This page is currently under construction."}
        </p>
        <div className="progress-indicator">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <span className="progress-text">Development in progress</span>
        </div>
      </div>
    </UnderConstructionStyled>
  );
};

export default UnderConstruction;
