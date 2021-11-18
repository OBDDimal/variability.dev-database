import { Component } from "react";
import AuthService from "../services/auth.service";

interface IUser {
  id?: any | null;
  email?: string;
  password?: string;
  roles?: Array<string>;
}

type Props = {};

type State = {
  userReady: boolean;
  currentUser: IUser & { accessToken: string };
};
export default class Profile extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      userReady: false,
      currentUser: { accessToken: "" },
    };
  }

  componentDidMount() {
    const currentUser = AuthService.getCurrentUser();

    if (!currentUser) window.location.replace("/");

    this.setState({ currentUser: currentUser, userReady: true });
  }

  render() {
    const { currentUser } = this.state;

    return (
      <div className='container'>
        {this.state.userReady ? (
          <div>
            <header className='jumbotron'>
              <h3>
                <strong>{currentUser.email}</strong> Profile
              </h3>
            </header>
            <p>
              <strong>Token:</strong> {AuthService.getAccessToken()}
            </p>
            <p>
              <strong>Id:</strong> {currentUser.id}
            </p>
            <strong>Authorities:</strong>
            <ul>
              {currentUser.roles &&
                currentUser.roles.map((role, index) => (
                  <li key={index}>{role}</li>
                ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
  }
}
