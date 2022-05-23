import React from 'react';
import { Container, Row } from 'react-bootstrap';
import FileIndex from './Files/FileIndex';

export default function Home() {
  return (
    <Container>
      <Row>
        <h2>Welcome to DDueruem</h2>
        <p>
          A web service for sharing feature model instances and collaborative
          benchmarking.
        </p>
        <FileIndex readonly />
      </Row>
    </Container>
  );
}
