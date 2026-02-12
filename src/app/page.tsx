"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { 
  FileText, 
  Users, 
  BarChart3, 
  Shield, 
  Zap, 
  Globe,
  ArrowRight,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function LandingPage() {
  const t = useTranslations("landing");
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");

  const features = [
    {
      icon: FileText,
      title: t("features.proposals.title"),
      description: t("features.proposals.description"),
    },
    {
      icon: Users,
      title: t("features.clients.title"),
      description: t("features.clients.description"),
    },
    {
      icon: BarChart3,
      title: t("features.analytics.title"),
      description: t("features.analytics.description"),
    },
    {
      icon: Shield,
      title: t("features.security.title"),
      description: t("features.security.description"),
    },
    {
      icon: Zap,
      title: t("features.fast.title"),
      description: t("features.fast.description"),
    },
    {
      icon: Globe,
      title: t("features.multilang.title"),
      description: t("features.multilang.description"),
    },
  ];

  const pricingTiers = [
    {
      name: t("pricing.starter.name"),
      price: t("pricing.starter.price"),
      description: t("pricing.starter.description"),
      features: t.raw("pricing.starter.features") as string[],
    },
    {
      name: t("pricing.professional.name"),
      price: t("pricing.professional.price"),
      description: t("pricing.professional.description"),
      features: t.raw("pricing.professional.features") as string[],
      popular: true,
    },
    {
      name: t("pricing.enterprise.name"),
      price: t("pricing.enterprise.price"),
      description: t("pricing.enterprise.description"),
      features: t.raw("pricing.enterprise.features") as string[],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              OfferCraft
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t("featuresTitle")}
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t("pricingTitle")}
            </Link>
            <LanguageSwitcher />
            <Link href="/login">
              <Button variant="ghost">{tAuth("login")}</Button>
            </Link>
            <Link href="/register">
              <Button>{tCommon("getStarted")}</Button>
            </Link>
          </nav>
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSwitcher />
            <Link href="/login">
              <Button variant="ghost" size="sm">{tAuth("login")}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              {t("heroTitle")}
              <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                {" "}{t("heroTitleHighlight")}
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              {t("heroDescription")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="text-lg px-8">
                  {t("startFreeTrial")}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  {tCommon("learnMore")}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Hero Image Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="bg-gradient-to-r from-primary/20 to-blue-400/20 rounded-xl p-1">
              <div className="bg-card rounded-lg h-[400px] flex items-center justify-center border">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">{t("dashboardPreview")}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t("featuresTitle")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("featuresDescription")}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card rounded-xl p-6 border hover:shadow-lg transition-shadow"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t("pricingTitle")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("pricingDescription")}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`bg-card rounded-xl p-6 border ${
                  tier.popular ? "border-primary shadow-lg scale-105" : ""
                }`}
              >
                {tier.popular && (
                  <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                    {t("mostPopular")}
                  </span>
                )}
                <h3 className="text-xl font-semibold mt-4">{tier.name}</h3>
                <p className="text-muted-foreground text-sm">{tier.description}</p>
                <div className="my-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  {tier.price !== "Custom" && tier.price !== "Me porosi" && (
                    <span className="text-muted-foreground">/{tCommon("month")}</span>
                  )}
                </div>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-primary mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={tier.popular ? "default" : "outline"}>
                  {tCommon("getStarted")}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">{t("ctaTitle")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            {t("ctaDescription")}
          </p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8">
              {t("startFreeTrial")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold">OfferCraft</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 OfferCraft. {t("footer")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
