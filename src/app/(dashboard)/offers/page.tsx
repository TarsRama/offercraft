"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Trash2,
  Send,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data - will be replaced with real data
const offers = [
  {
    id: "1",
    offerNumber: "OFF-2401-A1B2",
    title: "Office Renovation Project",
    client: "Acme Corp",
    status: "SENT",
    total: 45000,
    currency: "EUR",
    validUntil: "2024-02-28",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    offerNumber: "OFF-2401-C3D4",
    title: "Website Development",
    client: "TechStart Inc",
    status: "DRAFT",
    total: 12500,
    currency: "EUR",
    validUntil: "2024-03-15",
    createdAt: "2024-01-18",
  },
  {
    id: "3",
    offerNumber: "OFF-2401-E5F6",
    title: "Construction Materials Supply",
    client: "BuildRight LLC",
    status: "ACCEPTED",
    total: 89000,
    currency: "EUR",
    validUntil: "2024-02-20",
    createdAt: "2024-01-10",
  },
  {
    id: "4",
    offerNumber: "OFF-2401-G7H8",
    title: "Consulting Services Q1",
    client: "Global Partners",
    status: "VIEWED",
    total: 8500,
    currency: "EUR",
    validUntil: "2024-02-25",
    createdAt: "2024-01-20",
  },
  {
    id: "5",
    offerNumber: "OFF-2401-I9J0",
    title: "Equipment Maintenance",
    client: "Industrial Co",
    status: "REJECTED",
    total: 15000,
    currency: "EUR",
    validUntil: "2024-02-10",
    createdAt: "2024-01-05",
  },
];

export default function OffersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const t = useTranslations("offers");
  const tCommon = useTranslations("common");

  const statusConfig: Record<string, { label: string; variant: string; color: string }> = {
    DRAFT: { label: t("status.draft"), variant: "secondary", color: "bg-gray-500" },
    PENDING_APPROVAL: { label: t("status.pendingApproval"), variant: "outline", color: "bg-yellow-500" },
    SENT: { label: t("status.sent"), variant: "default", color: "bg-blue-500" },
    VIEWED: { label: t("status.viewed"), variant: "warning", color: "bg-orange-500" },
    ACCEPTED: { label: t("status.accepted"), variant: "success", color: "bg-green-500" },
    REJECTED: { label: t("status.rejected"), variant: "destructive", color: "bg-red-500" },
    WON: { label: t("status.won"), variant: "success", color: "bg-green-600" },
    LOST: { label: t("status.lost"), variant: "destructive", color: "bg-red-600" },
  };

  const filteredOffers = offers.filter(
    (offer) =>
      offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.offerNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <Link href="/dashboard/offers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t("newOffer")}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchOffers")}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          {tCommon("filters")}
        </Button>
      </div>

      {/* Offers List */}
      <Card>
        <CardHeader>
          <CardTitle>{t("allOffers")}</CardTitle>
          <CardDescription>
            {filteredOffers.length} {filteredOffers.length === 1 ? "offer" : "offers"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOffers.map((offer, index) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{offer.title}</p>
                      <Badge variant={statusConfig[offer.status].variant as any}>
                        {statusConfig[offer.status].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {offer.offerNumber} • {offer.client}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="font-medium">
                      {formatCurrency(offer.total, offer.currency)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(offer.validUntil).toLocaleDateString()}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        {tCommon("view")}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        {tCommon("edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        {tCommon("duplicate")}
                      </DropdownMenuItem>
                      {offer.status === "DRAFT" && (
                        <DropdownMenuItem>
                          <Send className="h-4 w-4 mr-2" />
                          {tCommon("send")}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        {tCommon("delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}

            {filteredOffers.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">{t("noOffers")}</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? t("noOffersSearch")
                    : t("noOffersStart")}
                </p>
                {!searchQuery && (
                  <Link href="/dashboard/offers/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      {t("createOffer")}
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
