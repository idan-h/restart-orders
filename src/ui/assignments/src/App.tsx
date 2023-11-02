import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import { LoginForm } from "./pages/login/LoginForm";
import { HomePage } from "./pages/home/HomePage";
import { EditOrder } from "./pages/edit-order/EditOrder";
import {Orders} from "./pages/catalog/Orders.tsx";
import {AssignedOrders} from "./pages/catalog/AssignedOrders.tsx";
import "./App.css";

function App() {
  return (
    <FluentProvider theme={webLightTheme} dir="rtl">
      <Router>
        <Routes>
          <Route path="/my-orders" Component={AssignedOrders}></Route>
          <Route path="/orders" Component={Orders}></Route>
          <Route path="/login" Component={LoginForm}></Route>
          <Route
            path="/edit-order/:orderId"
            // eslint-disable-next-line react-hooks/rules-of-hooks
            Component={() => <EditOrder orderId={useParams().orderId ?? ''} />}
          ></Route>
          <Route path="/" Component={HomePage}></Route>
        </Routes>
      </Router>
    </FluentProvider>
  );
}

export default App;
