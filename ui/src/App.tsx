import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './pages';
// import { Layout } from '@components';

const App = () => (
  // <Layout>
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />}>
        {/* <Route index element={<Home />} />
        <Route path="teams" element={<Teams />}>
          <Route path=":teamId" element={<Team />} />
          <Route path="new" element={<NewTeamForm />} />
          <Route index element={<LeagueStandings />} />
        </Route> */}
      </Route>
    </Routes>
  </BrowserRouter>
  // </Layout>
);

export default App;
