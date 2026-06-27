import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer.jsx';
import Header from './components/Header.jsx';
import ScrollToHash from './components/ScrollToHash.jsx';
import AboutPage from './pages/AboutPage.jsx';
import HomePage from './pages/HomePage.jsx';
import InsightsPage from './pages/InsightsPage.jsx';

function AppLayout({ children, showFooter = true }) {
  return (
    <main className="page-shell relative min-h-screen w-full max-w-full overflow-x-hidden bg-white text-ink touch-pan-y">
      <Header />
      {children}
      {showFooter && <Footer />}
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToHash />
      <Routes>
        <Route
          path="/"
          element={
            <AppLayout>
              <HomePage />
            </AppLayout>
          }
        />
        <Route
          path="/about"
          element={
            <AppLayout showFooter={false}>
              <AboutPage />
            </AppLayout>
          }
        />
        <Route
          path="/insights"
          element={
            <AppLayout showFooter={false}>
              <InsightsPage />
            </AppLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
