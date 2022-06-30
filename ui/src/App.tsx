import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';

const App = () => (
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
);

export default App;
