"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Globe, Facebook, Twitter, Instagram, Youtube } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="bg-slate-900 text-white">
      {/* Newsletter Section */}
      <div className="container py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-2">{t("subscribe_newsletter")}</h3>
          <p className="text-slate-300 mb-6">{t("get_latest")}</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder={t("enter_email")}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400"
            />
            <Button className="bg-blue-600 hover:bg-blue-700">{t("subscribe")}</Button>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="border-t border-slate-800">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
                <img src="/noBgWhiteLogo.png" alt="BTLE Logo" className="h-16 w-auto" />
              </Link>
              <p className="text-slate-300 mb-4">{t("discover_amazing")}</p>
              <div className="flex gap-4">
                <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-slate-800">
                  <Facebook className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-slate-800">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-slate-800">
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-slate-800">
                  <Youtube className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">{t("explore_footer")}</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-slate-300 hover:text-white transition-colors">
                    {t("experiences")}
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-slate-300 hover:text-white transition-colors">
                    {t("destinations")}
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-slate-300 hover:text-white transition-colors">
                    {t("all_categories")}
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-slate-300 hover:text-white transition-colors">
                    Travel Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">{t("company")}</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-slate-300 hover:text-white transition-colors">
                    {t("about_us")}
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-slate-300 hover:text-white transition-colors">
                    {t("careers")}
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-slate-300 hover:text-white transition-colors">
                    {t("contact_us")}
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-slate-300 hover:text-white transition-colors">
                    {t("partner_with_us")}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">{t("support")}</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-slate-300 hover:text-white transition-colors">
                    {t("help_center")}
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-slate-300 hover:text-white transition-colors">
                    {t("faq")}
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-slate-300 hover:text-white transition-colors">
                    {t("privacy_policy")}
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-slate-300 hover:text-white transition-colors">
                    {t("terms_service")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800 py-6">
        <div className="container flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} BTLE. {t("all_rights_reserved")}
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/" className="text-slate-400 text-sm hover:text-white transition-colors">
              {t("privacy")}
            </Link>
            <Link href="/" className="text-slate-400 text-sm hover:text-white transition-colors">
              {t("terms")}
            </Link>
            <Link href="/" className="text-slate-400 text-sm hover:text-white transition-colors">
              {t("sitemap")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
