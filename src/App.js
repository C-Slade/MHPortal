import UserLayout from "./user-layout/app.jsx";
import { DocProvider } from "./context/docContext";
import { TrainingProvider } from "./context/trainingContext";

function App() {
  return (
    <>
      <DocProvider>
        <TrainingProvider>
          <UserLayout />
        </TrainingProvider>
      </DocProvider>
    </>
  );
}

export default App;
