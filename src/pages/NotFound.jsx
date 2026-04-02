import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import Navbar from '@/components/layout/Navbar';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <PageWrapper className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center px-4"
        >
          <div className="text-8xl font-display gradient-text mb-4">404</div>
          <h1 className="text-2xl font-display text-text-primary mb-2">State Not Found</h1>
          <p className="text-text-secondary mb-8">
            This state doesn't exist in the automaton. No transition defined.
          </p>
          <Link to="/">
            <Button variant="primary">
              <Home size={16} />
              Return to Start State
            </Button>
          </Link>
        </motion.div>
      </PageWrapper>
    </>
  );
}
