
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Footer = ({ className }: { className?: string }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn("w-full py-6 px-6 bg-muted/30 border-t", className)}>
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Mental Math</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Improve your math skills with our engaging practice app designed for learners of all ages.
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              © {currentYear} MathCraft Learning, Inc. All rights reserved.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold mb-3">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/leaderboard" className="text-sm text-muted-foreground hover:text-foreground">
                    Leaderboard
                  </Link>
                </li>
                <li>
                  <Link to="/plans" className="text-sm text-muted-foreground hover:text-foreground">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-3">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
