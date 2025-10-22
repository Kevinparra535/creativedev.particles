import styled from 'styled-components';
import { cssVariables } from '@/ui/styles/base';

export const FooterRoot = styled.footer`
  padding: ${cssVariables.spacing.xl} ${cssVariables.spacing.lg};
  color: var(--text-primary);
  text-align: center;
  font-family: var(--font-body);
  background-color: transparent;

  h2 {
    font-size: 32px;
    margin-bottom: ${cssVariables.spacing.sm};
    font-family: var(--font-heading);
  }
`;

export const FooterContainer = styled.div`
  display: flex;
  margin: 0 auto;
  max-width: 1200px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
