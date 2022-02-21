import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

jest.mock("./components/SiteNavbar", () => () => {
  return <div data-testid="navbar"></div>;
});

jest.mock("./routes/Files/FileEdit", () => () => {
  return <div data-testid="fileedit"></div>;
});

jest.mock("./routes/Files/FileIndex", () => () => {
  return <div data-testid="fileindex"></div>;
});

jest.mock("./routes/Files/FileCreate", () => () => {
  return <div data-testid="filecreate"></div>;
});

jest.mock("./routes/Tags/TagCreate", () => () => {
  return <div data-testid="tagcreate"></div>;
});

jest.mock("./routes/Tags/TagIndex", () => () => {
  return <div data-testid="tagindex"></div>;
});

describe("<App />", () => {
  test("Is SiteNavbar properly rendered?", async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    const navbar = await screen.findByTestId("navbar");
    expect(navbar).toBeInTheDocument();
  });
});
