"use client"

import Link from "next/link"
import Image from "next/image"
import { Phone, Mail, Facebook, Twitter, Instagram, Youtube } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Logo and Social Media */}
          <div className="space-y-6">
            <Link href="/">
              <Image
                src="/noBgWhiteLogo.png"
                alt="BTLE Logo"
                width={120}
                height={40}
                className="mb-4"
              />
            </Link>
            {/* Social Media Icons */}
            <div className="flex gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
                <Twitter size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
                <Instagram size={20} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="hover:text-gray-300">Help Center</Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-gray-300">FAQ</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-gray-300">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-gray-300">Terms of Service</Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone size={18} />
                <a href="tel:+998939514964" className="hover:text-gray-300">+998 93 951 49 64</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={18} />
                <a href="mailto:info@btle.uz" className="hover:text-gray-300">info@btle.uz</a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-sm text-gray-400 text-center">
          <p>© {new Date().getFullYear()} BTLE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
