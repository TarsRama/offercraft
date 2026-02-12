"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { 
  FileText, 
  ArrowLeft, 
  Download,
  Send,
  Eye,
  Edit,
  Copy,
  Share,
  Printer,
  Calendar,
  User,
  Building2,
  Calculator,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface OfferSection {
  id: string;
  title: string;
  description: string;
  articles: Article[];
}

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

interface OfferData {
  id: string;
  offerNumber: string;
  title: string;
  status: string;
  currency: string;
  validUntil: string;
  subtotal: number;
  discountTotal: number;
  vatTotal: number;
  total: number;
  createdAt: string;
  client: {
    companyName: string;
    email: string;
    phone?: string;
  };
  sections: OfferSection[];
}

// Mock data for demonstration
const mockOffer: OfferData = {
  id: "1",
  offerNumber: "OFR-202601-0001",
  title: "Office Renovation Project",
  status: "SENT",
  currency: "EUR",
  validUntil: "2024-03-15",
  subtotal: 45000,
  discountTotal: 2250,
  vatTotal: 8977.5,
  total: 51727.5,
  createdAt: "2024-01-15",
  client: {
    companyName: "Acme Corp",
    email: "contact@acme.com",
    phone: "+1 (555) 123-4567",
  },
  sections: [
    {
      id: "section-1",
      title: "Design & Planning",
      description: "Initial design work and project planning",
      articles: [
        {
          id: "article-1",
          name: "Architectural Design",
          description: "Complete office layout and design plans",
          quantity: 1,
          unit: "project",
          unitPrice: 5000,
          vatRate: 21,
          discountPercent: 0,
          total: 6050,
        },
        {
          id: "article-2",
          name: "Project Management",
          description: "Full project coordination and management",
          quantity: 3,
          unit: "months",
          unitPrice: 2000,
          vatRate: 21,
          discountPercent: 10,
          total: 6534,
        },
      ],
    },
    {
      id: "section-2",
      title: "Construction Work",
      description: "Main construction and renovation work",
      articles: [
        {
          id: "article-3",
          name: "Interior Construction",
          description: "Walls, flooring, ceiling work",
          quantity: 200,
          unit: "m2",
          unitPrice: 150,
          vatRate: 21,
          discountPercent: 5,
          total: 34447.5,
        },
      ],
    },
  ],
};

export default function OfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("offers");
  const tCommon = useTranslations("common");
  
  const [offer, setOffer] = useState<OfferData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call - replace with real API call
    setTimeout(() => {
      setOffer(mockOffer);
      setIsLoading(false);
    }, 500);
  }, [params.id]);

  const getStatusConfig = (status: string) => {
    const configs = {
      DRAFT: { label: t("status.draft"), variant: "secondary", icon: Edit, color: "text-gray-500" },
      SENT: { label: t("status.sent"), variant: "default", icon: Send, color: "text-blue-500" },
      VIEWED: { label: t("status.viewed"), variant: "warning", icon: Eye, color: "text-orange-500" },
      ACCEPTED: { label: t("status.accepted"), variant: "success", icon: CheckCircle2, color: "text-green-500" },
      REJECTED: { label: t("status.rejected"), variant: "destructive", icon: XCircle, color: "text-red-500" },
    };
    return configs[status as keyof typeof configs] || configs.DRAFT;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: offer?.currency || "EUR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleGeneratePDF = async () => {
    try {
      const { generateOfferPDF } = await import("@/lib/pdf-generator");
      const success = await generateOfferPDF(offer);
      
      if (success) {
        toast.success("PDF generated successfully!");
      } else {
        toast.error("Failed to generate PDF");
      }
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const handleSendOffer = () => {
    toast.info("Email sending is coming soon!");
    // TODO: Implement email sending
  };

  const handleShareOffer = () => {
    toast.info("Share functionality is coming soon!");
    // TODO: Implement share functionality
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">Offer not found</h3>
        <p className="text-muted-foreground">The requested offer could not be found.</p>
      </div>
    );
  }

  const statusConfig = getStatusConfig(offer.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight">{offer.title}</h1>
              <Badge variant={statusConfig.variant as any} className="flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-muted-foreground">{offer.offerNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleShareOffer}>
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" onClick={handleGeneratePDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          {offer.status === "DRAFT" && (
            <Button onClick={handleSendOffer}>
              <Send className="h-4 w-4 mr-2" />
              Send Offer
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Offer Details */}
          <Card>
            <CardHeader>
              <CardTitle>Offer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Client</h4>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{offer.client.companyName}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{offer.client.email}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Timeline</h4>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Valid until {formatDate(offer.validUntil)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Created on {formatDate(offer.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Offer Sections */}
          {offer.sections.map((section, sectionIndex) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: sectionIndex * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                  {section.description && (
                    <CardDescription>{section.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {section.articles.map((article, articleIndex) => (
                      <div
                        key={article.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div className="flex-1">
                          <h5 className="font-medium">{article.name}</h5>
                          {article.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {article.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span>{article.quantity} {article.unit}</span>
                            <span>@ {formatCurrency(article.unitPrice)}</span>
                            {article.discountPercent > 0 && (
                              <span className="text-red-600">
                                -{article.discountPercent}% discount
                              </span>
                            )}
                            <span>{article.vatRate}% VAT</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(article.total)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
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
                  <span>{formatCurrency(offer.subtotal)}</span>
                </div>
                {offer.discountTotal > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>{t("discount")}</span>
                    <span>-{formatCurrency(offer.discountTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{t("vat")}</span>
                  <span>{formatCurrency(offer.vatTotal)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>{t("total")}</span>
                  <span>{formatCurrency(offer.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Edit className="h-4 w-4 mr-2" />
                Edit Offer
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Copy className="h-4 w-4 mr-2" />
                Duplicate Offer
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}