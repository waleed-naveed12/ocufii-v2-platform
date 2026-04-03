import styled from "styled-components";

export const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid #f0f0f0;
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 600px;
`;

export const TableHead = styled.thead`
  background-color: #fafafa;
`;

export const TableBody = styled.tbody`
  tr:hover {
    background-color: #fafbfc;
  }
`;

export const TableRow = styled.tr`
  transition: ${({ theme }) => theme.transitions.fast};
`;

export const TableHeader = styled.th`
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  text-align: left;
  font-size: ${({ theme }) => theme.fontSize.xs};
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;

  &:first-child {
    border-top-left-radius: ${({ theme }) => theme.borderRadius.lg};
  }

  &:last-child {
    border-top-right-radius: ${({ theme }) => theme.borderRadius.lg};
  }
`;

export const TableCell = styled.td`
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  font-size: ${({ theme }) => theme.fontSize.sm};
  color: ${({ theme }) => theme.colors.textPrimary};
  border-bottom: 1px solid #f3f4f6;
  font-weight: ${({ theme }) => theme.fontWeight.regular};

  &:first-child {
    color: #6b7280;
    font-size: ${({ theme }) => theme.fontSize.xs};
  }
`;

export const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: ${({ theme }) => `4px 10px`};
  border-radius: 6px;
  font-size: 11px;
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  text-transform: capitalize;
  letter-spacing: 0.3px;

  &::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    display: inline-block;
  }

  ${({ status }) =>
    status
      ? `
    background-color: #ecfdf5;
    color: #059669;
    border: 1px solid #a7f3d0;
    
    &::before {
      background-color: #10b981;
    }
  `
      : `
    background-color: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
    
    &::before {
      background-color: #ef4444;
    }
  
  `}
`;

export const TableHeader2 = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};

  h1 {
    margin: 0;
    font-size: ${({ theme }) => theme.fontSize.xxl};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  .count {
    font-size: ${({ theme }) => theme.fontSize.sm};
    color: #6b7280;
    font-weight: ${({ theme }) => theme.fontWeight.regular};
    background: #f9fafb;
    padding: ${({ theme }) => `6px 14px`};
    border-radius: 20px;
    border: 1px solid #e5e7eb;
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => `${theme.spacing.xxl} ${theme.spacing.lg}`};
  color: #9ca3af;
  font-size: ${({ theme }) => theme.fontSize.md};
  font-weight: ${({ theme }) => theme.fontWeight.regular};
`;
