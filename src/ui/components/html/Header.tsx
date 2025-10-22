import Logo from '@/ui/assets/images/icons/favicon.png';
import {
  HeaderRoot,
  HeaderContainer,
  HeaderTitle,
  HeaderInfo,
  HeaderActions
} from '../../styles/Header.styled';
import { getContrastColor } from '@/utils/color';
import useSceneSettings from '@/ui/hooks/useSceneSettings';

const Header = () => {
  const s = useSceneSettings();
  const textColor = getContrastColor(s.bgColor);

  return (
    <HeaderRoot>
      <HeaderContainer>
        <HeaderTitle>
          <img src={Logo} alt='Logo' />
          <h1 style={{ color: textColor }}>Creative Labs</h1>
        </HeaderTitle>
        <HeaderInfo>
          <span style={{ color: textColor }}>Part of</span>
          <span style={{ color: textColor }}>Kevin Parra | @kevcoder</span>
        </HeaderInfo>
      </HeaderContainer>

      <HeaderActions>
        <a href='https://links.kevcoder.co/' target='_blank' rel='noopener'>
          Contact
        </a>
      </HeaderActions>
    </HeaderRoot>
  );
};

export default Header;
