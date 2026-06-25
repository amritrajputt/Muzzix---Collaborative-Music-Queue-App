import { useState, useEffect } from "react";
import LandingPage from "./pages/LandingPage";
import { TextHoverEffect } from "./components/ui/text-hover-effect";
import { AnimatePresence, motion } from "framer-motion";
import "./App.css";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="scroll-container bg-black min-h-screen relative overflow-hidden">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black px-5 sm:px-10"
          >
            <div className="w-full max-w-2xl md:max-w-3xl h-36 sm:h-48 md:h-64 flex items-center justify-center">
              <TextHoverEffect text="MUZZIX" />
            </div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 0.4, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-white font-light text-center"
            >
              Get ready for the queue
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          >
            <LandingPage />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
