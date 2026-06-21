import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import GlobalCanvasBackground from './components/GlobalCanvasBackground';



// Pages
import Home from './pages/Home';
import Guidelines from './pages/Guidelines';
import ProblemStatements from './pages/ProblemStatements';
import FAQ from './pages/FAQ';
import ContactUs from './pages/ContactUs';

function App() {
  return (
    <Router>
      <main className="min-h-screen bg-[#fce4c0] selection:bg-sih-orange/30 selection:text-sih-navy font-roboto text-sih-gray-dark flex flex-col">
        {/* Global Canvas Background */}
        <GlobalCanvasBackground />
        {/* Sticky Header Nav */}
        <div className="sticky top-0 z-[100] w-full shadow-md">
          <Header />
        </div>

        <div className="flex-1 bg-white">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/guidelines" element={<Guidelines />} />
            <Route path="/problem-statements" element={<ProblemStatements />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<ContactUs />} />
          </Routes>
        </div>

        <Footer />
      </main>
    </Router>
  );
}

export default App;
