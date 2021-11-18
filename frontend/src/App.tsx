import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import { Route, Routes } from "react-router-dom";
import SiteNavbar from "./components/SiteNavbar";
import Upload from "./routes/Upload";
import { Container, Row } from "react-bootstrap";
import Home from "./routes/Home";
import Login from "./components/login.component";
import Register from "./components/register.component";
import Profile from "./components/profile.component";

function App() {
  return (
    <>
      <SiteNavbar
        url={window.location.href.substr(window.location.href.lastIndexOf("/"))}
      />
      <Container>
        <Row>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/upload' element={<Upload />} />
            <Route path='/login' element={<Login />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/register' element={<Register />} />
          </Routes>
        </Row>
      </Container>
    </>
  );
}

export default App;
