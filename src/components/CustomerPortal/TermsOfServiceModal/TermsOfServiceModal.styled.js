import styled from "styled-components";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
`;

export const ModalContainer = styled.div`
  background: #fff;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
  overflow: hidden;
`;

export const ModalHeader = styled.div`
  padding: 28px 24px 16px;
  text-align: center;
  // background: #fff;
  flex-shrink: 0;
`;

export const LogoImg = styled.img`
  width: 130px;
  margin-bottom: 14px;
`;

export const NewBadge = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 4px;
`;

export const ModalTitle = styled.div`
  font-size: 19px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.3;
  margin-bottom: 6px;
`;

export const ModalSubtitle = styled.div`
  font-size: 13px;
  color: #888;
`;

export const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  margin: 12px 16px;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  font-size: 13px;
  color: #333;
  line-height: 1.6;
  min-height: 0;

  p {
    margin: 0 0 10px;
  }

  strong {
    font-weight: 600;
  }

  ul {
    padding-left: 20px;
    margin: 0 0 10px;
  }

  li {
    margin-bottom: 4px;
  }

  a {
    color: #f7941d;
    text-decoration: none;
  }
`;

export const ModalFooter = styled.div`
  padding: 12px 16px 20px;
  background: #fff;
  flex-shrink: 0;
`;

export const AcceptButton = styled.button`
  width: 100%;
  padding: 16px;
  background: ${(props) => (props.disabled ? "#ccc" : "#F7941D")};
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 17px;
  font-weight: 600;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: background 0.2s;

  &:hover:not(:disabled) {
    background: #e8850b;
  }
`;
