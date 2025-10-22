import Logo from '@/ui/assets/images/icons/favicon.png';
import {
  HeaderRoot,
  HeaderContainer,
  HeaderTitle,
  HeaderInfo,
  HeaderActions,
} from '../../styles/Header.styled';

const Header = () => {
  return (
    <HeaderRoot>
      <HeaderContainer>
        <HeaderTitle>
          <img src={Logo} alt='Logo' />
          <h1>Creative Developer</h1>
        </HeaderTitle>
        <HeaderInfo>
          <span>Porfolio of</span>
          <span>Kevin Parra | @kevcoder</span>
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
