import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import "bootstrap/dist/css/bootstrap.min.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import SiteNavbar from "./components/SiteNavbar";
import Upload from "./routes/Upload";

ReactDOM.render(
  <React.StrictMode>
    <SiteNavbar
      url={window.location.href.substr(window.location.href.lastIndexOf("/"))}
    />
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<App />} />
        <Route path='upload' element={<Upload />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
