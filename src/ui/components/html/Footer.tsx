import { FooterContainer, FooterRoot } from '@/ui/styles/Footer.styled';

const Footer = () => {
  return (
    <FooterRoot>
      <FooterContainer>
        <p>Press space key to toggle speed</p>

        <p>
          Made it with love❤️ <br />{' '}
          <a href='https://www.linkedin.com/in/kmp535/' target='_blank' rel='noopener'>
            Kevin Parra
          </a>
        </p>
      </FooterContainer>
    </FooterRoot>
  );
};

export default Footer;
