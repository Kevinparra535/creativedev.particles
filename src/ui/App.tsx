// import Controls from "./components/controls/Controls";
import Header from './components/html/Header';
import Footer from './components/html/Footer';
import R3FCanva from './components/scene/R3FCanva';
import { GlobalStyles, BaseContainer } from './styles/base';
import { GlobalFonts } from './styles/fonts';
import { themeUtils } from './styles/theme';
import { useEffect } from 'react';

const App = () => {
  useEffect(() => {
    // Apply light theme by default
    themeUtils.applyTheme('light');
  }, []);

  return (
    <>
      <GlobalFonts />
      <GlobalStyles />

      <Header />

      <BaseContainer>
        <R3FCanva />
      </BaseContainer>

      <Footer />
    </>
  );
};

export default App;
