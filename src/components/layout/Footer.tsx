import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero">
                <span className="text-lg font-bold text-primary-foreground">H</span>
              </div>
              <span className="text-xl font-bold">HalalRx</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Made by Muslims, for Muslims. Built by a Doctor of Pharmacy who understands 
              both the clinical and religious considerations. Every ingredient is reviewed with care and expertise.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/app" className="hover:text-primary transition-colors">Scanner</Link></li>
              <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link to="/app" className="hover:text-primary transition-colors">OTC Products</Link></li>
              <li><Link to="/app" className="hover:text-primary transition-colors">Rx Medications</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#faq" className="hover:text-primary transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Ingredient Database</a></li>
              <li><Link to="/feedback" className="hover:text-primary transition-colors">Share Feedback</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Disclaimer</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} HalalRx. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground text-center md:text-right max-w-lg">
              Disclaimer: This tool provides informational guidance only. Always verify halal status with manufacturers, 
              certified halal organizations, or qualified Islamic scholars. Medical necessity (darura) may permit otherwise 
              impermissible ingredients.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
