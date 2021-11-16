import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import "bootstrap/dist/css/bootstrap.min.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import SiteNavbar from "./components/SiteNavbar";
import Upload from "./routes/Upload";
import { Container, Row } from "react-bootstrap";
import {RouteComponentProps}  from "react-router-dom";
import Login from "./routes/Login";

ReactDOM.render(
  <React.StrictMode>
    <SiteNavbar
      url={window.location.href.substr(window.location.href.lastIndexOf("/"))}
    />
    <Container>
      <Row>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<App />} />
            <Route path='upload' element={<Upload />} />
            <Route path='login' element={<Login />} />
          </Routes>
        </BrowserRouter>
      </Row>
    </Container>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
