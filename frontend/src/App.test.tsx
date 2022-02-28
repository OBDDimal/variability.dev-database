import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

jest.mock('./components/SiteNavbar', () => function () {
  return <div data-testid="navbar" />;
});

jest.mock('./routes/Files/FileEdit', () => function () {
  return <div data-testid="fileedit" />;
});

jest.mock('./routes/Files/FileIndex', () => function () {
  return <div data-testid="fileindex" />;
});

jest.mock('./routes/Files/FileCreate', () => function () {
  return <div data-testid="filecreate" />;
});

jest.mock('./routes/Tags/TagCreate', () => function () {
  return <div data-testid="tagcreate" />;
});

jest.mock('./routes/Tags/TagIndex', () => function () {
  return <div data-testid="tagindex" />;
});

describe('<App />', () => {
  test('Is SiteNavbar properly rendered?', async () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    const navbar = await screen.findByTestId('navbar');
    expect(navbar).toBeInTheDocument();
  });
});
