import { fireEvent, render, screen } from "@testing-library/react";
import FileCreate from "./Files/FileCreate";
import api from "../services/api.service";

jest.mock("../services/api.service");
const mockedApi = api as jest.Mocked<typeof api>;

interface Tag {
  id: number;
  label: string;
}

describe("<FileCreate />", () => {
  test("button should be initially disabled", async () => {
    mockedApi.get.mockResolvedValue(
      new Promise((resolve, reject) => {
        let mockedTags: Tag[] = [{ id: 1337, label: "testlabel" }];
        let mockedResponse = { data: { results: mockedTags } };
        resolve(mockedResponse);
      })
    );
    render(<FileCreate />);
    const uploadButton = screen.getByText(/Upload!/i) as HTMLButtonElement;
    expect(uploadButton.disabled).toBeTruthy();
  });

  test("button should enable after label, description, file, legalShare, userData and openSource have been entered", async () => {
    mockedApi.get.mockResolvedValue(
      new Promise((resolve, reject) => {
        let mockedTags: Tag[] = [{ id: 1337, label: "testlabel" }];
        let mockedResponse = { data: { results: mockedTags } };
        resolve(mockedResponse);
      })
    );
    render(<FileCreate />);

    const uploadButton = screen.getByText(/Upload!/i) as HTMLButtonElement;
    expect(uploadButton.disabled).toBeTruthy();

    //type label
    const labelFormControl = await screen.findByTestId("label");
    fireEvent.change(labelFormControl, {
      target: { value: "test label" },
    });

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
    mockedApi.get.mockResolvedValue(
      new Promise((resolve, reject) => {
        let mockedTags: Tag[] = [{ id: 1337, label: "testlabel" }];
        let mockedResponse = { data: { results: mockedTags } };
        resolve(mockedResponse);
      })
    );
    render(<FileCreate />);

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
    mockedApi.get.mockResolvedValue(
      new Promise((resolve, reject) => {
        let mockedTags: Tag[] = [{ id: 1337, label: "testlabel" }];
        let mockedResponse = { data: { results: mockedTags } };
        resolve(mockedResponse);
      })
    );
    render(<FileCreate />);

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
