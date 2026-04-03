import styled from "styled-components";

export const DashboardContent = styled.div`
  h1 {
    font-size: ${({ theme }) => theme.fontSize.xxxl};
    font-weight: ${({ theme }) => theme.fontWeight.bold};
    color: ${({ theme }) => theme.colors.textPrimary};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }

  p {
    font-size: ${({ theme }) => theme.fontSize.md};
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.6;
  }

  .welcome-card {
    background-color: ${({ theme }) => theme.colors.white};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    padding: ${({ theme }) => theme.spacing.xl};
    box-shadow: ${({ theme }) => theme.shadows.md};
    margin-bottom: ${({ theme }) => theme.spacing.xl};
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: ${({ theme }) => theme.spacing.lg};
    margin-top: ${({ theme }) => theme.spacing.xl};
  }

  .stat-card {
    background-color: ${({ theme }) => theme.colors.white};
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    padding: ${({ theme }) => theme.spacing.lg};
    box-shadow: ${({ theme }) => theme.shadows.sm};
    border-left: 4px solid ${({ theme }) => theme.colors.primary};
    transition: ${({ theme }) => theme.transitions.fast};

    &:hover {
      box-shadow: ${({ theme }) => theme.shadows.md};
      transform: translateY(-2px);
    }

    h3 {
      font-size: ${({ theme }) => theme.fontSize.sm};
      color: ${({ theme }) => theme.colors.textSecondary};
      margin-bottom: ${({ theme }) => theme.spacing.sm};
      text-transform: uppercase;
      font-weight: ${({ theme }) => theme.fontWeight.semibold};
    }

    .stat-value {
      font-size: ${({ theme }) => theme.fontSize.xxxl};
      font-weight: ${({ theme }) => theme.fontWeight.bold};
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;
