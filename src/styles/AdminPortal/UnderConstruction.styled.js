import styled, { keyframes } from "styled-components";

const toolRotate = keyframes`
  0% { transform: rotate(0deg); }
  25% { transform: rotate(15deg); }
  50% { transform: rotate(-10deg); }
  75% { transform: rotate(5deg); }
  100% { transform: rotate(0deg); }
`;

const clockTick = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const progressAnimation = keyframes`
  0% { width: 0%; }
  50% { width: 70%; }
  100% { width: 45%; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const UnderConstructionStyled = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  margin: 1rem;
  width: 100%;
  animation: ${fadeIn} 0.6s ease-out;

  .construction-container {
    text-align: center;
    max-width: 500px;
    padding: 2rem;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid #e9ecef;
  }

  .icon-container {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem;
    width: 80px;
    height: 80px;
  }

  .tool-icon {
    font-size: 2.5rem;
    color: #015ce9;
    animation: ${toolRotate} 3s ease-in-out infinite;
    z-index: 2;
  }

  .clock-icon {
    position: absolute;
    font-size: 1.5rem;
    color: #6c757d;
    top: -10px;
    right: -10px;
    animation: ${clockTick} 4s linear infinite;
    opacity: 0.7;
  }

  .construction-title {
    font-size: 1.75rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 1rem;
    letter-spacing: -0.5px;
  }

  .construction-message {
    font-size: 1rem;
    color: #6c757d;
    line-height: 1.6;
    margin-bottom: 2rem;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }

  .progress-indicator {
    margin-top: 2rem;
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background-color: #e9ecef;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 0.75rem;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #015ce9, #4dabf7);
    border-radius: 3px;
    animation: ${progressAnimation} 3s ease-in-out infinite;
    box-shadow: 0 0 10px rgba(1, 92, 233, 0.3);
  }

  .progress-text {
    font-size: 0.875rem;
    color: #015ce9;
    font-weight: 500;
    letter-spacing: 0.5px;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    padding: 1rem;
    min-height: 300px;

    .construction-container {
      padding: 1.5rem;
    }

    .construction-title {
      font-size: 1.5rem;
    }

    .construction-message {
      font-size: 0.9rem;
    }

    .icon-container {
      width: 60px;
      height: 60px;
    }

    .tool-icon {
      font-size: 2rem;
    }

    .clock-icon {
      font-size: 1.2rem;
    }
  }

  @media (max-width: 480px) {
    .construction-container {
      padding: 1rem;
    }

    .construction-title {
      font-size: 1.25rem;
    }
  }
`;
