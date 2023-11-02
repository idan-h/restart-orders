import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { LoginForm } from "./pages/login/LoginForm";
import { HomePage } from './pages/home/HomePage';
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" Component={LoginForm}></Route>
        <Route path="/" Component={HomePage}></Route>
      </Routes>
    </Router>
  );
}

export default App;
