import Controls from "./components/controls/Controls";
import R3FCanva from "./components/R3FCanva";
import { GlobalStyles, BaseContainer } from "./styles/base";

const App = () => {
  return (
    <>
      <Controls />

      {/* Aplica estilos globales al HTML y #root */}
      <GlobalStyles />

      <BaseContainer>
        <R3FCanva />
      </BaseContainer>
    </>
  );
};

export default App;
