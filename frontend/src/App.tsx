import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import { Navigate, Route, Routes } from "react-router-dom";
import SiteNavbar from "./components/SiteNavbar";
import Upload from "./routes/Upload";
import { Container, Row } from "react-bootstrap";
import Home from "./routes/Home";
import Login from "./components/login.component";
import Register from "./components/register.component";
import Profile from "./components/profile.component";
import authService from "./services/auth.service";

interface AuthChildren {
  children: JSX.Element; // Maybe there is a way to define this better and directly in RequireAuth
}

function RequireAuth({ children }: AuthChildren) {
  const authenticated = authService.getCurrentUser() ?? undefined;

  return authenticated ? children : <Navigate to='/login' replace />;
}

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
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route
              path='/upload'
              element={
                <RequireAuth>
                  <Upload />
                </RequireAuth>
              }
            />
            <Route
              path='/profile'
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />
          </Routes>
        </Row>
      </Container>
    </>
  );
}

export default App;
