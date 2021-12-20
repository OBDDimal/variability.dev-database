import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Upload from "./Upload";
import { AxiosRequestConfig } from "axios";
import api from "../services/api.service";

/*jest.mock("../services/api.service", () => {
  return {
    __esModule: true,
    default: () => {
      return {
        post: (url: string, data?: FormData | undefined, config?: AxiosRequestConfig<FormData> | undefined) => {
          return new Promise((resolve, reject) => {
            process.nextTick(() => {
              resolve("I am an API result")
            })
          })
        }
      }
    }
  }
})*/

jest.mock("../services/api.service");

describe("<Upload />", () => {
  test("button should be initially disabled", async () => {
    render(<Upload />);
    const uploadButton = screen.getByText(/Upload!/i) as HTMLButtonElement;
    expect(uploadButton.disabled).toBeTruthy();
  });

  test("button should enable after description, file, legalShare, userData and openSource have been entered", async () => {
    render(<Upload />);

    const uploadButton = screen.getByText(/Upload!/i) as HTMLButtonElement;
    expect(uploadButton.disabled).toBeTruthy();

    //type description
    const descriptionFormControl = await screen.findByTestId("description");
    fireEvent.change(descriptionFormControl, {
      target: { value: "test description" },
    });

    //select file
    const fileUploadFormControl = await screen.findByTestId("file-upload");
    fireEvent.change(fileUploadFormControl, {
      target: { files: ["testfile content"] },
    });

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

  test("button should not enable if no file has been selected", async () => {
    render(<Upload />);

    const uploadButton = screen.getByText(/Upload!/i) as HTMLButtonElement;
    expect(uploadButton.disabled).toBeTruthy();

    //type description
    const descriptionFormControl = await screen.findByTestId("description");
    fireEvent.change(descriptionFormControl, {
      target: { value: "test description" },
    });

    //select file
    const fileUploadFormControl = await screen.findByTestId("file-upload");
    fireEvent.change(fileUploadFormControl, { target: {} });

    //click legal share checkbox
    const legalShareCheckbox = await screen.findByTestId("legal-share");
    fireEvent.click(legalShareCheckbox);

    //click user data checkbox
    const userDataCheckbox = await screen.findByTestId("user-data");
    fireEvent.click(userDataCheckbox);

    //click open source checkbox
    const openSourceCheckbox = await screen.findByTestId("open-source");
    fireEvent.click(openSourceCheckbox);

    expect(uploadButton.disabled).toBeTruthy();
  });

  test("submit data should reset the form", async () => {
    render(<Upload />);

    //type description
    const descriptionFormControl = (await screen.findByTestId(
      "description"
    )) as HTMLTextAreaElement;
    fireEvent.change(descriptionFormControl, {
      target: { value: "test description" },
    });

    //select file
    const fileUploadFormControl = (await screen.findByTestId(
      "file-upload"
    )) as HTMLInputElement;
    fireEvent.change(fileUploadFormControl, {
      target: { files: ["testfile content"] },
    });

    //click legal share checkbox
    const legalShareCheckbox = (await screen.findByTestId(
      "legal-share"
    )) as HTMLInputElement;
    fireEvent.click(legalShareCheckbox);

    //click user data checkbox
    const userDataCheckbox = (await screen.findByTestId(
      "user-data"
    )) as HTMLInputElement;
    fireEvent.click(userDataCheckbox);

    //click open source checkbox
    const openSourceCheckbox = (await screen.findByTestId(
      "open-source"
    )) as HTMLInputElement;
    fireEvent.click(openSourceCheckbox);

    //click Upload!
    const uploadButton = screen.getByText(/Upload!/i) as HTMLButtonElement;
    fireEvent.click(uploadButton);

    const response = "test response";
    (api.post as jest.Mock).mockResolvedValue(response);

    expect(descriptionFormControl.value).toBeUndefined();
    expect(fileUploadFormControl.files).toBeUndefined();
    expect(legalShareCheckbox.checked).toBeFalsy();
    expect(userDataCheckbox.checked).toBeFalsy();
    expect(openSourceCheckbox.checked).toBeFalsy();
  });
});
