import React from "react";
import {render, screen} from "@testing-library/react";
import App from "./App";
import {BrowserRouter} from "react-router-dom";

jest.mock("./components/SiteNavbar", () => () => <div data-testid="navbar"></div>);

describe("<App />", () => {

  test('Is SiteNavbar properly rendered?', async () => {
    render(
      <BrowserRouter>
        <App/>
      </BrowserRouter>);

    const navbar = await screen.findByTestId("navbar");
    expect(navbar).toBeInTheDocument();
  });

})


