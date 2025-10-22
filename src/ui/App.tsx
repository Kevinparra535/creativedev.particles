// import Controls from "./components/controls/Controls";
import Header from './components/html/Header';
import Footer from './components/html/Footer';
import R3FCanva from './components/scene/R3FCanva';
import { GlobalStyles, BaseContainer } from './styles/base';
import { GlobalFonts } from './styles/fonts';

const App = () => {
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
