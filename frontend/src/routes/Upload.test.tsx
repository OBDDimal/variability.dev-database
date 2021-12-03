import React from "react";
import {render, screen} from "@testing-library/react";
import Upload from "./Upload";

describe("<Upload />", () => {
  describe("Description tests", () => {
    test('is there a "Description" label', () => {
      render(<Upload/>);
      const linkElement = screen.getByText(/Description/i);
      expect(linkElement).toBeInTheDocument();
    });

    test('is there a description form control', async () => {
      render(<Upload/>);
      const descriptionFormControl = await screen.findByTestId("description");
      expect(descriptionFormControl).toBeInTheDocument();
    });
  })

  /*describe("File Upload tests", () => {
    test('is there a "File Upload" label', () => {
      render(<Upload/>);
      const linkElement = screen.getByText(/File Upload/i);
      expect(linkElement).toBeInTheDocument();
    });
  })*/
})


