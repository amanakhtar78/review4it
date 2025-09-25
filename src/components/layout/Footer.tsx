"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FaTwitter,
  FaFacebookF,
  FaWhatsapp,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";

export default function Footer() {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  return (
    <footer className="bg-card border-t border-border py-6 text-center text-muted-foreground">
      <div className="container mx-auto px-4 space-y-3">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Review4it. All rights reserved.
        </p>
        <p className="text-xs">
          Movie data and images are for demonstration purposes only.
        </p>

        {/* Social Links */}
        <div className="flex justify-center space-x-4 mt-2 text-lg">
          <Link href="https://twitter.com" target="_blank" aria-label="Twitter">
            <FaTwitter className="hover:text-foreground transition" />
          </Link>
          <Link
            href="https://facebook.com"
            target="_blank"
            aria-label="Facebook"
          >
            <FaFacebookF className="hover:text-foreground transition" />
          </Link>
          <Link
            href="https://wa.me/?text=Check%20out%20Review4it"
            target="_blank"
            aria-label="WhatsApp"
          >
            <FaWhatsapp className="hover:text-foreground transition" />
          </Link>
          <Link
            href="https://instagram.com"
            target="_blank"
            aria-label="Instagram"
          >
            <FaInstagram className="hover:text-foreground transition" />
          </Link>
          <Link href="https://youtube.com" target="_blank" aria-label="YouTube">
            <FaYoutube className="hover:text-foreground transition" />
          </Link>
        </div>

        {/* Links */}
        <div className="flex justify-center space-x-4 text-xs mt-2">
          <button
            onClick={() => setShowPrivacy(true)}
            className="hover:underline"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setShowDisclaimer(true)}
            className="hover:underline"
          >
            Disclaimer
          </button>
        </div>

        {/* Developer Credit */}
        <p className="text-xs mt-3">
          Developed by{" "}
          <a
            href="mailto:amanv.code@gmail.com"
            className="underline hover:text-foreground"
          >
            amanv.code@gmail.com
          </a>
        </p>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl shadow-lg max-w-lg w-full p-6 text-left">
            <h2 className="text-lg font-bold mb-3">Privacy Policy</h2>
            <p className="text-sm text-muted-foreground">
              We respect your privacy. This app does not collect personal data
              without your consent. Any analytics or third-party integrations
              follow their respective policies.
            </p>
            <button
              onClick={() => setShowPrivacy(false)}
              className="mt-4 text-sm px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl shadow-lg max-w-lg w-full p-6 text-left">
            <h2 className="text-lg font-bold mb-3">Disclaimer</h2>
            <p className="text-sm text-muted-foreground space-y-2">
              This application provides predictions and estimates regarding
              movies, including earnings, ratings, and popularity.
              <br />
              These values are <strong>not exact</strong> and should not be
              taken as financial or factual guarantees.
              <br />
              The data is gathered and generated from public sources, websites,
              news outlets, and AI-based analysis.
              <br />
              <strong>Always do your own research</strong> before making any
              assumptions based on the information shown here.
            </p>
            <button
              onClick={() => setShowDisclaimer(false)}
              className="mt-4 text-sm px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}
