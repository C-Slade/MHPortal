import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/authContext";
import AdminLayout from "./admin/app.jsx";
import UserLayout from "./user/app.jsx";

function App() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const getComponent = () => {
    if (currentUser === null) navigate("/login");
    else if (currentUser.admin === true) return <AdminLayout />;
    else return <UserLayout />;
  };

  return <>{getComponent()}</>;
}

export default App;
