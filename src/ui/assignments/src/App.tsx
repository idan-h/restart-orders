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
import {Catalog} from "./pages/catalog/Catalog.tsx";
import {AboutUs} from "./pages/about/AboutUs.tsx";
import "./App.css";

function App() {
  return (
    <FluentProvider theme={webLightTheme} dir="rtl">
      <Router>
        <Routes>
          <Route path="/catalog" Component={Catalog}></Route>
          <Route path="/login" Component={LoginForm}></Route>
          <Route path="/about-us" Component={AboutUs}></Route>
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
