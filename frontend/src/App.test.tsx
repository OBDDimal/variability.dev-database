import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

jest.mock('./components/SiteNavbar', () => <div data-testid="navbar" />);

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
