import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/app", label: "Scanner" },
  { href: "/browse", label: "Browse" },
  { href: "/pricing", label: "Pricing" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 pt-2 sm:px-4 sm:pt-4">
      <div className="container max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={cn(
            "flex h-14 items-center justify-between px-4 md:px-6",
            "rounded-2xl border border-border/50",
            "bg-background/70 backdrop-blur-xl",
            "shadow-lg shadow-background/5"
          )}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
              <span className="text-sm font-bold text-primary-foreground">H</span>
            </div>
            <span className="text-lg font-bold text-foreground">HalalRx</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  location.pathname === link.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/account">
              <Button variant="ghost" size="sm" className="rounded-xl">
                <User className="h-4 w-4 mr-2" />
                Account
              </Button>
            </Link>
            <Link to="/app">
              <Button size="sm" className="rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
                Start Free
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-muted/50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </motion.div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="mt-2 rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl p-4 shadow-xl"
            >
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "px-4 py-3 rounded-xl text-base font-medium transition-all",
                      location.pathname === link.href
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <hr className="my-2 border-border/50" />
                <Link to="/account" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full rounded-xl">
                    <User className="h-4 w-4 mr-2" />
                    Account
                  </Button>
                </Link>
                <Link to="/app" onClick={() => setMobileMenuOpen(false)} className="mt-2">
                  <Button className="w-full rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground">
                    Start Scanning Free
                  </Button>
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
