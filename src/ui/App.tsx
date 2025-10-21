// import Controls from "./components/controls/Controls";
import R3FCanva from "./components/scene/R3FCanva";
import { GlobalStyles, BaseContainer } from "./styles/base";

const App = () => {
  return (
    <>
      {/* Legacy GUI now handled by LegacyGUI in Scene1 */}
      {/* <Controls /> */}

      {/* Aplica estilos globales al HTML y #root */}
      <GlobalStyles />

      <BaseContainer>
        <R3FCanva />
      </BaseContainer>
    </>
  );
};

export default App;
