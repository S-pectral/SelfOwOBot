import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './views/Dashboard';
import { Settings } from './views/Settings';
import { Logs } from './views/Logs';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="logs" element={<Logs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
