import React from 'react';
import FileIndex from './Files/FileIndex.tsx';

export default function Home() {
  return (
    <>
      <h2>Welcome to DDueruem</h2>
      <p>
        A web service for sharing feature model instances and collaborative
        benchmarking.
      </p>
      <FileIndex readonly />
    </>
  );
}
