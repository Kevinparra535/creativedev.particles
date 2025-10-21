// import Controls from "./components/controls/Controls";
import R3FCanva from './components/scene/R3FCanva';
import { GlobalStyles, BaseContainer } from './styles/base';

const App = () => {
  return (
    <>
      <GlobalStyles />

      <BaseContainer>
        <R3FCanva />
      </BaseContainer>
    </>
  );
};

export default App;
