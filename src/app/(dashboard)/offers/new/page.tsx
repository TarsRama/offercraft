"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { 
  Plus, 
  X, 
  GripVertical,
  Save,
  ArrowLeft,
  Trash2,
  FileText,
  DollarSign,
  Calculator
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Article {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  vatRate: number;
  discountPercent: number;
  total: number;
}

interface OfferSection {
  id: string;
  title: string;
  description: string;
  articles: Article[];
  sortOrder: number;
}

interface Client {
  id: string;
  companyName: string;
  email: string;
}

export default function NewOfferPage() {
  const router = useRouter();
  const t = useTranslations("offers");
  const tCommon = useTranslations("common");
  
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [offer, setOffer] = useState({
    title: "",
    clientId: "",
    currency: "EUR",
    validUntil: "",
    executiveSummary: "",
    termsAndConditions: "",
  });
  
  const [sections, setSections] = useState<OfferSection[]>([
    {
      id: "section-1",
      title: "Services",
      description: "Professional services and deliverables",
      articles: [],
      sortOrder: 0,
    }
  ]);

  const [totals, setTotals] = useState({
    subtotal: 0,
    discountTotal: 0,
    vatTotal: 0,
    total: 0,
  });

  useEffect(() => {
    calculateTotals();
  }, [sections]);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients");
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setClientsLoading(false);
    }
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let discountTotal = 0;
    let vatTotal = 0;

    sections.forEach(section => {
      section.articles.forEach(article => {
        const lineTotal = article.quantity * article.unitPrice;
        const discountAmount = (lineTotal * article.discountPercent) / 100;
        const taxableAmount = lineTotal - discountAmount;
        const vatAmount = (taxableAmount * article.vatRate) / 100;
        
        subtotal += lineTotal;
        discountTotal += discountAmount;
        vatTotal += vatAmount;
      });
    });

    const total = subtotal - discountTotal + vatTotal;

    setTotals({
      subtotal,
      discountTotal,
      vatTotal,
      total,
    });
  };

  const addSection = () => {
    const newSection: OfferSection = {
      id: `section-${Date.now()}`,
      title: `Section ${sections.length + 1}`,
      description: "",
      articles: [],
      sortOrder: sections.length,
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (sectionId: string, field: keyof OfferSection, value: any) => {
    setSections(sections.map(section => 
      section.id === sectionId ? { ...section, [field]: value } : section
    ));
  };

  const removeSection = (sectionId: string) => {
    setSections(sections.filter(section => section.id !== sectionId));
  };

  const addArticle = (sectionId: string) => {
    const newArticle: Article = {
      id: `article-${Date.now()}`,
      name: "",
      description: "",
      quantity: 1,
      unit: "pcs",
      unitPrice: 0,
      vatRate: 21,
      discountPercent: 0,
      total: 0,
    };

    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, articles: [...section.articles, newArticle] }
        : section
    ));
  };

  const updateArticle = (sectionId: string, articleId: string, field: keyof Article, value: any) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            articles: section.articles.map(article =>
              article.id === articleId 
                ? { ...article, [field]: value, total: calculateArticleTotal({ ...article, [field]: value }) }
                : article
            )
          }
        : section
    ));
  };

  const removeArticle = (sectionId: string, articleId: string) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, articles: section.articles.filter(article => article.id !== articleId) }
        : section
    ));
  };

  const calculateArticleTotal = (article: Article) => {
    const lineTotal = article.quantity * article.unitPrice;
    const discountAmount = (lineTotal * article.discountPercent) / 100;
    const taxableAmount = lineTotal - discountAmount;
    const vatAmount = (taxableAmount * article.vatRate) / 100;
    return taxableAmount + vatAmount;
  };

  const handleSave = async (status: "DRAFT" | "SENT" = "DRAFT") => {
    if (!offer.title || !offer.clientId) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsLoading(true);

    try {
      const offerData = {
        ...offer,
        status,
        sections: sections.map(section => ({
          ...section,
          articles: section.articles.map(article => ({
            ...article,
            total: calculateArticleTotal(article),
          })),
        })),
        subtotal: totals.subtotal,
        discountTotal: totals.discountTotal,
        vatTotal: totals.vatTotal,
        total: totals.total,
      };

      const response = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offerData),
      });

      if (!response.ok) {
        throw new Error("Failed to create offer");
      }

      const data = await response.json();
      toast.success("Offer created successfully");
      router.push(`/dashboard/offers/${data.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create offer");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: offer.currency,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("newOffer")}</h1>
          <p className="text-muted-foreground">{t("createNewOfferDesc")}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t("basicInformation")}</CardTitle>
              <CardDescription>{t("offerDetailsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">{t("offerTitle")} *</Label>
                  <Input
                    id="title"
                    placeholder="Enter offer title"
                    value={offer.title}
                    onChange={(e) => setOffer({ ...offer, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client">{t("client")} *</Label>
                  <Select value={offer.clientId} onValueChange={(value) => setOffer({ ...offer, clientId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={clientsLoading ? "Loading clients..." : "Select client"} />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.companyName}
                        </SelectItem>
                      ))}
                      {clients.length === 0 && !clientsLoading && (
                        <SelectItem value="" disabled>
                          No clients found
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">{t("currency")}</Label>
                  <Select value={offer.currency} onValueChange={(value) => setOffer({ ...offer, currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validUntil">{t("validUntil")}</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={offer.validUntil}
                    onChange={(e) => setOffer({ ...offer, validUntil: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">{t("executiveSummary")}</Label>
                <textarea
                  id="summary"
                  className="w-full min-h-[100px] p-3 border rounded-md"
                  placeholder="Brief overview of the offer..."
                  value={offer.executiveSummary}
                  onChange={(e) => setOffer({ ...offer, executiveSummary: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Sections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t("sections")}</h3>
              <Button onClick={addSection} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t("addSection")}
              </Button>
            </div>

            {sections.map((section, sectionIndex) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: sectionIndex * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <Input
                          value={section.title}
                          onChange={(e) => updateSection(section.id, "title", e.target.value)}
                          className="text-lg font-semibold border-none p-0 h-auto"
                        />
                      </div>
                      {sections.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSection(section.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <Input
                      placeholder="Section description..."
                      value={section.description}
                      onChange={(e) => updateSection(section.id, "description", e.target.value)}
                      className="text-sm border-none p-0"
                    />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Articles */}
                    <div className="space-y-3">
                      {section.articles.map((article, articleIndex) => (
                        <div key={article.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Article {articleIndex + 1}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeArticle(section.id, article.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="sm:col-span-2">
                              <Label className="text-xs">Article Name *</Label>
                              <Input
                                placeholder="Article name"
                                value={article.name}
                                onChange={(e) => updateArticle(section.id, article.id, "name", e.target.value)}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Quantity</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={article.quantity}
                                onChange={(e) => updateArticle(section.id, article.id, "quantity", parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Unit</Label>
                              <Select
                                value={article.unit}
                                onValueChange={(value) => updateArticle(section.id, article.id, "unit", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pcs">Pieces</SelectItem>
                                  <SelectItem value="hours">Hours</SelectItem>
                                  <SelectItem value="days">Days</SelectItem>
                                  <SelectItem value="kg">Kilograms</SelectItem>
                                  <SelectItem value="m">Meters</SelectItem>
                                  <SelectItem value="m2">Square meters</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">Unit Price ({offer.currency})</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={article.unitPrice}
                                onChange={(e) => updateArticle(section.id, article.id, "unitPrice", parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">VAT Rate (%)</Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={article.vatRate}
                                onChange={(e) => updateArticle(section.id, article.id, "vatRate", parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Discount (%)</Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={article.discountPercent}
                                onChange={(e) => updateArticle(section.id, article.id, "discountPercent", parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Total</Label>
                              <div className="text-sm font-medium py-2">
                                {formatCurrency(article.total)}
                              </div>
                            </div>
                          </div>

                          <div>
                            <Label className="text-xs">Description</Label>
                            <Input
                              placeholder="Article description..."
                              value={article.description}
                              onChange={(e) => updateArticle(section.id, article.id, "description", e.target.value)}
                            />
                          </div>
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        onClick={() => addArticle(section.id)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t("addArticle")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{tCommon("actions")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => handleSave("DRAFT")}
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                <Save className="h-4 w-4 mr-2" />
                {tCommon("saveDraft")}
              </Button>
              <Button
                onClick={() => handleSave("SENT")}
                disabled={isLoading}
                className="w-full"
              >
                <FileText className="h-4 w-4 mr-2" />
                {t("createAndSend")}
              </Button>
            </CardContent>
          </Card>

          {/* Pricing Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                {t("pricingSummary")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t("subtotal")}</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                {totals.discountTotal > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>{t("discount")}</span>
                    <span>-{formatCurrency(totals.discountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{t("vat")}</span>
                  <span>{formatCurrency(totals.vatTotal)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>{t("total")}</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}