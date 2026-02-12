"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { 
  Building2, 
  User, 
  Bell, 
  Palette, 
  Globe,
  CreditCard,
  Shield,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("company");
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");

  const settingsSections = [
    { id: "company", title: t("sections.company"), icon: Building2 },
    { id: "profile", title: t("sections.profile"), icon: User },
    { id: "notifications", title: t("sections.notifications"), icon: Bell },
    { id: "appearance", title: t("sections.appearance"), icon: Palette },
    { id: "localization", title: t("sections.localization"), icon: Globe },
    { id: "billing", title: t("sections.billing"), icon: CreditCard },
    { id: "security", title: t("sections.security"), icon: Shield },
  ];

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    toast.success(t("savedSuccess"));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <Card className="lg:w-64 shrink-0">
          <CardContent className="p-4">
            <nav className="space-y-1">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <section.icon className="h-4 w-4" />
                  {section.title}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Content */}
        <div className="flex-1">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeSection === "company" && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("company.title")}</CardTitle>
                  <CardDescription>
                    {t("company.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">{t("company.companyName")}</Label>
                    <Input id="companyName" placeholder="Acme Inc." defaultValue="Acme Inc." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("company.email")}</Label>
                      <Input id="email" type="email" placeholder="contact@company.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t("company.phone")}</Label>
                      <Input id="phone" placeholder="+1 234 567 890" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">{t("company.address")}</Label>
                    <Input id="address" placeholder="123 Business St, City" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vatNumber">{t("company.vatNumber")}</Label>
                    <Input id="vatNumber" placeholder="VAT123456789" />
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-medium">{t("company.branding")}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="primaryColor">{t("company.primaryColor")}</Label>
                        <div className="flex gap-2">
                          <Input id="primaryColor" defaultValue="#3B82F6" />
                          <div className="w-10 h-10 rounded-md bg-primary border" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="logo">{t("company.logo")}</Label>
                        <Input id="logo" type="file" accept="image/*" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("profile.title")}</CardTitle>
                  <CardDescription>
                    {t("profile.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t("profile.firstName")}</Label>
                      <Input id="firstName" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t("profile.lastName")}</Label>
                      <Input id="lastName" placeholder="Doe" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profileEmail">{t("profile.email")}</Label>
                    <Input id="profileEmail" type="email" placeholder="john@company.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profilePhone">{t("profile.phone")}</Label>
                    <Input id="profilePhone" placeholder="+1 234 567 890" />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "localization" && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("localization.title")}</CardTitle>
                  <CardDescription>
                    {t("localization.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="language">{t("localization.defaultLanguage")}</Label>
                    <Input id="language" defaultValue="English" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">{t("localization.defaultCurrency")}</Label>
                    <Input id="currency" defaultValue="EUR" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">{t("localization.dateFormat")}</Label>
                    <Input id="dateFormat" defaultValue="DD/MM/YYYY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">{t("localization.timezone")}</Label>
                    <Input id="timezone" defaultValue="Europe/London" />
                  </div>
                </CardContent>
              </Card>
            )}

            {(activeSection === "notifications" || 
              activeSection === "appearance" || 
              activeSection === "billing" ||
              activeSection === "security") && (
              <Card>
                <CardHeader>
                  <CardTitle>{settingsSections.find(s => s.id === activeSection)?.title}</CardTitle>
                  <CardDescription>
                    {tCommon("comingSoon")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {tCommon("futureUpdate")}
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? t("saving") : t("saveChanges")}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
