import R3FCanva from "./components/R3FCanva";
import { GlobalStyles, BaseContainer } from "./styles/base";

const App = () => {
  return (
    <>
      {/* Aplica estilos globales al HTML y #root */}
      <GlobalStyles />

      <BaseContainer>
        <R3FCanva />
      </BaseContainer>
    </>
  );
};

export default App;
