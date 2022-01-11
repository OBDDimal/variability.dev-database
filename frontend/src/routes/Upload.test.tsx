import React from "react";
import {fireEvent, render, screen} from "@testing-library/react";
import FileCreate from "./Files/FileCreate";

describe("<Upload />", () => {
  test('button should be initially disabled', async () => {
    render(<FileCreate/>);
    const uploadButton = screen.getByText(/Upload!/i) as HTMLButtonElement;
    expect(uploadButton.disabled).toBeTruthy();
  });

  test('button should enable after description, file, legalShare, userData and openSource have been entered', async () => {
    render(<FileCreate/>);

    const uploadButton = screen.getByText(/Upload!/i) as HTMLButtonElement;
    expect(uploadButton.disabled).toBeTruthy();

    //type description
    const descriptionFormControl = await screen.findByTestId("description");
    fireEvent.change(descriptionFormControl, {target: {value: 'test description'}});

    //select file
    const fileUploadFormControl = await screen.findByTestId("file-upload");
    fireEvent.change(fileUploadFormControl, {target: {files: ['testfile content']}});

    //click legal share checkbox
    const legalShareCheckbox = await screen.findByTestId("legal-share");
    fireEvent.click(legalShareCheckbox);

    //click user data checkbox
    const userDataCheckbox = await screen.findByTestId("user-data");
    fireEvent.click(userDataCheckbox);

    //click open source checkbox
    const openSourceCheckbox = await screen.findByTestId("open-source");
    fireEvent.click(openSourceCheckbox);

    expect(uploadButton.disabled).toBeFalsy();
  });
})


