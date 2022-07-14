import { Route, Switch } from 'react-router';
import { ConnectedRouter } from 'connected-react-router';
import { Login, Register, Messenger } from './pages';
import { Layout, AuthController } from 'components';
import Theme from 'Theme';
import { Provider } from 'react-redux';
import { store, history } from 'redux-manager';
import { NotificationProvider } from 'utils';

const App = () => (
  <Theme>
    <NotificationProvider>
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <Switch>
            <Route exact path="/" component={Login} />
            <Route path="/register" component={Register} />
            <Route>
              <AuthController>
                <Layout>
                  <Switch>
                    <Route path="/channels" component={Messenger} />
                  </Switch>
                </Layout>
              </AuthController>
            </Route>
          </Switch>
        </ConnectedRouter>
      </Provider>
    </NotificationProvider>
  </Theme>
);

export default App;
