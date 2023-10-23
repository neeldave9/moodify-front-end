import "./App.css";
import { Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar/NavBar";
import Home from "./pages/Home/index";

import Error from "./components/Error/Error";

import "bootstrap/dist/css/bootstrap.css";

function App() {
  document.title = "Moodify";
  return (
    <div className="App">
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route
          path="*"
          element={
            <Error
              name="Page"
              type="404"
              description="This page could not be found. Please try again later."
            />
          }
        ></Route>
      </Routes>
    </div>
  );
}
export default App;
