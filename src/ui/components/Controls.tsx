import { useControls } from "leva";

const Controls = () => {
  const { name, aNumber } = useControls({ name: "World", aNumber: 0 });

  return (
    <div>
      Hey {name}, hello! {aNumber}
    </div>
  );
};

export default Controls;