import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import SiteNavbar from './components/SiteNavbar.tsx';
import FileCreate from './routes/Files/FileCreate.tsx';
import Home from './routes/Home.tsx';
import Login from './routes/Login.tsx';
import Register from './routes/Register.tsx';
import Profile from './routes/Profile.tsx';
import authService from './services/auth.service.ts';
import FileIndex from './routes/Files/FileIndex.tsx';
import './styles/app.css';
import TagIndex from './routes/Tags/TagIndex.tsx';
import FileShow from './routes/Files/FileShow.tsx';
import TagCreate from './routes/Tags/TagCreate.tsx';
import FileEdit from './routes/Files/FileEdit.tsx';

interface AuthChildren {
  // Maybe there is a way to define this
  // better and directly in RequireAuth
  children: JSX.Element; }

/**
 * Checks whether a user is authenticated.
 * @return {AuthChildren} TSX child if authenticated,
 * a redirect to home otherwise
 */
function RequireAuth({ children }: AuthChildren) {
  const authenticated = authService.getCurrentUser() ?? undefined;
  return authenticated ? children : <Navigate to="/login" replace />;
}

/**
 * Initializes the React app
 * @return {JSX} React app
 */
function App() {
  return (
    <>
      <SiteNavbar
        url={window.location.href.substr(window.location.href.lastIndexOf('/'))}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/files/create"
          element={(
            <RequireAuth>
              <FileCreate />
            </RequireAuth>
          )}
        />
        <Route
          path="/files"
          element={(
            <RequireAuth>
              <FileIndex />
            </RequireAuth>
          )}
        />
        <Route
          path="/profile"
          element={(
            <RequireAuth>
              <Profile />
            </RequireAuth>
          )}
        />
        <Route path="/files/:id" element={<FileShow />} />
        <Route
          path="/files/edit/:id"
          element={(
            <RequireAuth>
              <FileEdit />
            </RequireAuth>
          )}
        />
        <Route
          path="/tags"
          element={(
            <RequireAuth>
              <TagIndex />
            </RequireAuth>
          )}
        />
        <Route
          path="/tags/create"
          element={(
            <RequireAuth>
              <TagCreate />
            </RequireAuth>
          )}
        />
      </Routes>
    </>
  );
}

export default App;
