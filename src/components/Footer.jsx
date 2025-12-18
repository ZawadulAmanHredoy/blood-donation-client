// client/src/components/Footer.jsx
import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-white/10 bg-[#0b1220] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center font-bold">
                L
              </div>
              <div>
                <h3 className="text-lg font-semibold">Lifeline</h3>
                <p className="text-sm text-white/60">
                  Blood donation & request management.
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-white/60 leading-relaxed">
              Connecting donors with those in need — faster, safer, and more
              organized.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold tracking-wide text-white/80">
              Quick Links
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link className="text-white/60 hover:text-white" to="/">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  className="text-white/60 hover:text-white"
                  to="/donation-requests"
                >
                  Donation Requests
                </Link>
              </li>
              <li>
                <Link
                  className="text-white/60 hover:text-white"
                  to="/search-donors"
                >
                  Search Donors
                </Link>
              </li>
              <li>
                <Link
                  className="text-white/60 hover:text-white"
                  to="/dashboard"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold tracking-wide text-white/80">
              Support
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <span className="text-white/60">Help Center</span>
              </li>
              <li>
                <span className="text-white/60">Privacy Policy</span>
              </li>
              <li>
                <span className="text-white/60">Terms & Conditions</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold tracking-wide text-white/80">
              Contact
            </h4>
            <div className="mt-4 space-y-2 text-sm text-white/60">
              <p>Phone: +880 1XXXXXXXXX</p>
              <p>Email: support@lifeline.com</p>
              <p>Address: Dhaka, Bangladesh</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-white/50">
            © {year} Lifeline. All rights reserved.
          </p>

          <div className="flex gap-4 text-xs">
            <span className="text-white/50">Made with MERN</span>
            <span className="text-white/20">|</span>
            <span className="text-white/50">Stay healthy. Donate blood.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
