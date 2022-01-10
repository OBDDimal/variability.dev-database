import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { useParams } from "react-router-dom";
import Select from "react-select";
import api from "../../services/api.service";

const API_URL = process.env.REACT_APP_DOMAIN;

type fileType = {
  label?: string;
  description?: string;
  tags?: [{ id: number; label: string }];
  new_version_of?: number;
};

function FileEdit() {
  const { id } = useParams<"id">();
  const [fileState, setFileState] = useState([] as fileType);

  const [labelState, setLabelState] = useState("");
  const [descriptionState, setDescriptionState] = useState("");
  const [gottenFilesState, setGottenFilesState] = useState(
    [] as Array<{ value: string; label: string }>
  );
  const [gottenTagsState, setGottenTagsState] = useState(
    [] as Array<{ value: string; label: string }>
  );
  const [newVersionOfState, setNewVersionOfState] = useState("");
  const [tagsState, setTagsState] = useState("");

  useEffect(() => {
    api.get(`${API_URL}files/${id}/`).then((response) => {
      setFileState(response.data);
      getNewVersionOf();
      getTags();
    });
  }, [id]);

  const getTags = () => {
    api.get(API_URL + "tags/").then((response) => {
      let tags = response.data.results;
      tags = tags.map((tag: { id: number; label: string }) => {
        return { value: tag.id.toString(), label: tag.label };
      });
      setGottenTagsState(tags);
    });
  };

  const getNewVersionOf = () => {
    api.get(API_URL + "files/").then((response) => {
      let files = response.data.results;
      files = files.map((file: { id: number; label: string }) => {
        return { value: file.id.toString(), label: file.label };
      });
      setGottenFilesState(files);
    });
  };

  const onLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const label = e.target as HTMLInputElement;
    setLabelState(label.value);
  };

  const onDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const description = e.target as HTMLInputElement;
    setDescriptionState(description.value);
  };

  const onNewVersionOfChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVersionOf = e.target as HTMLSelectElement;
    setNewVersionOfState(newVersionOf.value);
  };

  const onTagChange = (options: any) => {
    setTagsState(
      options.map((option: any) => {
        return { id: option.value, label: option.label };
      })
    );
  };

  // const onSubmit = () => {};

  // label, description, tags, new_version_of
  return (
    <>
      <Form.Group className='mb-3'>
        <Form.Label>File name</Form.Label>
        <Form.Control
          data-testid='label'
          onChange={onLabelChange}
          placeholder='Leave a filename'
          value={fileState.label}
        />
      </Form.Group>
      <Form.Group className='mb-3'>
        <Form.Label>Description</Form.Label>
        <Form.Control
          data-testid='description'
          as='textarea'
          onChange={onDescriptionChange}
          placeholder='Leave a comment here'
          value={fileState.description}
        />
      </Form.Group>
      <Form.Group className='mb-3'>
        <Form.Label>New version of</Form.Label>
        <Form.Select
          onChange={onNewVersionOfChange}
          defaultValue={fileState.new_version_of}
        >
          {gottenFilesState.map((key) => {
            return (
              <option key={key.value} value={key.value}>
                {key.value}: {key.label}
              </option>
            );
          })}
          <option key='---' value='---'>
            ---
          </option>
        </Form.Select>
        <Form.Group className='mb-3'>
          <Form.Label>Tags</Form.Label>
          <Select
            defaultValue={{ key: "Tobi", value: "1" }}
            isMulti
            onChange={onTagChange}
            options={[{ key: "Tobi", value: "1" }]}
          />
        </Form.Group>
      </Form.Group>
    </>
  );
}

export default FileEdit;
