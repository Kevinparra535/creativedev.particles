import styled from 'styled-components';
import { spacing, colors } from './scssTokens';

export const FooterRoot = styled.footer`
  padding: ${spacing.space} ${spacing.space};
  position: fixed;
  bottom: 0;
  width: 100%;
  color: var(--text-primary);
  text-align: center;
  font-family: var(--font-body);
  background-color: transparent;
`;

export const FooterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: row;

  p {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    margin: 0;
    color: ${colors.light};
  }
`;
