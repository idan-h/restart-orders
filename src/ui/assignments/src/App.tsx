import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { LoginForm } from "./pages/login/LoginForm";
import { HomePage } from "./pages/home/HomePage";
import {Catalog} from "./Catalog.tsx";
import "./App.css";

function App() {
  return (
    <FluentProvider theme={webLightTheme}>
      <Router>
        <Routes>
          <Route path="/catalog" Component={Catalog}></Route>
          <Route path="/login" Component={LoginForm}></Route>
          <Route path="/" Component={HomePage}></Route>
        </Routes>
      </Router>
    </FluentProvider>
  );
}

export default App;
