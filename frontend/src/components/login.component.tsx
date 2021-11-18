import { Component } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";

import AuthService from "../services/auth.service";

type Props = {};

type State = {
  email: String;
  password: String;
  loading: boolean;
  message: String;
};

export default class Login extends Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.handleLogin = this.handleLogin.bind(this);

    this.state = {
      email: "",
      password: "",
      loading: false,
      message: "",
    };
  }

  validationSchema() {
    return Yup.object().shape({
      email: Yup.string().required("This field is required!"),
      password: Yup.string().required("This field is required!"),
    });
  }

  handleLogin(formValue: { email: string; password: string }) {
    const { email, password } = formValue;

    this.setState({
      message: "",
      loading: true,
    });

    AuthService.login(email, password).then(
      () => {
        window.location.replace("/");
      },
      (error) => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();

        this.setState({
          loading: false,
          message: resMessage,
        });
      }
    );
  }

  render() {
    const initialValues = {
      email: "",
      password: "",
    };

    return (
      <div className='col-md-12'>
        <div className='card card-container'>
          <img
            src='//ssl.gstatic.com/accounts/ui/avatar_2x.png'
            alt='profile-img'
            className='profile-img-card'
          />

          <Formik
            initialValues={initialValues}
            validationSchema={this.validationSchema}
            onSubmit={this.handleLogin}
          >
            <Form>
              <div className='form-group'>
                <label htmlFor='email'>Email</label>
                <Field name='email' type='text' className='form-control' />
                <ErrorMessage
                  name='email'
                  component='div'
                  className='alert alert-danger'
                />
              </div>

              <div className='form-group'>
                <label htmlFor='password'>Password</label>
                <Field
                  name='password'
                  type='password'
                  className='form-control'
                />
                <ErrorMessage
                  name='password'
                  component='div'
                  className='alert alert-danger'
                />
              </div>

              <div className='form-group'>
                <button
                  type='submit'
                  className='btn btn-primary btn-block'
                  disabled={this.state.loading}
                >
                  {this.state.loading && (
                    <span className='spinner-border spinner-border-sm'></span>
                  )}
                  <span>Login</span>
                </button>
              </div>

              {this.state.message && (
                <div className='form-group'>
                  <div className='alert alert-danger' role='alert'>
                    {this.state.message}
                  </div>
                </div>
              )}
            </Form>
          </Formik>
        </div>
      </div>
    );
  }
}
