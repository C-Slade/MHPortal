import UserLayout from "./user-layout/app.jsx";
import { DocProvider } from "./context/docContext";

function App() {
  return (
    <>
      <DocProvider>
        <UserLayout />
      </DocProvider>
    </>
  );
}

export default App;
