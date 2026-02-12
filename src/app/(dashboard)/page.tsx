"use client";

import { motion } from "framer-motion";
import { 
  FileText, 
  Users, 
  TrendingUp, 
  Clock,
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const recentOffers = [
  {
    id: "1",
    title: "Office Renovation Project",
    client: "Acme Corp",
    status: "SENT",
    total: 45000,
    currency: "EUR",
    date: "2 hours ago",
    viewedAt: null,
  },
  {
    id: "2",
    title: "Website Development",
    client: "TechStart Inc",
    status: "DRAFT",
    total: 12500,
    currency: "EUR",
    date: "5 hours ago",
    viewedAt: null,
  },
  {
    id: "3",
    title: "Construction Materials",
    client: "BuildRight LLC",
    status: "ACCEPTED",
    total: 89000,
    currency: "EUR",
    date: "1 day ago",
    viewedAt: "2024-01-12",
  },
  {
    id: "4",
    title: "Consulting Services",
    client: "Global Partners",
    status: "VIEWED",
    total: 8500,
    currency: "EUR",
    date: "2 days ago",
    viewedAt: "2024-01-13",
  },
  {
    id: "5",
    title: "Marketing Campaign",
    client: "Creative Agency",
    status: "REJECTED",
    total: 25000,
    currency: "EUR",
    date: "3 days ago",
    viewedAt: "2024-01-11",
  },
  {
    id: "6",
    title: "Software License",
    client: "Tech Solutions",
    status: "WON",
    total: 15000,
    currency: "EUR",
    date: "1 week ago",
    viewedAt: "2024-01-08",
  },
];

const statusColors: Record<string, string> = {
  DRAFT: "secondary",
  SENT: "default",
  VIEWED: "warning",
  ACCEPTED: "success",
  REJECTED: "destructive",
};

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tOffers = useTranslations("offers");
  const tCommon = useTranslations("common");

  const stats = [
    {
      title: t("totalOffers"),
      value: "128",
      change: "+12%",
      trend: "up",
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: t("activeClients"),
      value: "45",
      change: "+8%",
      trend: "up",
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: t("winRate"),
      value: "67%",
      change: "+5%",
      trend: "up",
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: t("pendingOffers"),
      value: "12",
      change: "-2",
      trend: "down",
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      DRAFT: tOffers("status.draft"),
      SENT: tOffers("status.sent"),
      VIEWED: tOffers("status.viewed"),
      ACCEPTED: tOffers("status.accepted"),
      REJECTED: tOffers("status.rejected"),
    };
    return statusMap[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("welcomeBack")}</h1>
          <p className="text-muted-foreground">
            {t("todayOverview")}
          </p>
        </div>
        <Link href="/dashboard/offers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {tOffers("newOffer")}
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div className={`flex items-center text-sm ${
                    stat.trend === "up" ? "text-green-500" : "text-red-500"
                  }`}>
                    {stat.change}
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4 ml-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Offers */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("recentOffers")}</CardTitle>
                <CardDescription>{t("latestProposals")}</CardDescription>
              </div>
              <Link href="/dashboard/offers">
                <Button variant="outline" size="sm">{tCommon("viewAll")}</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{offer.title}</p>
                      <p className="text-sm text-muted-foreground">{offer.client}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={statusColors[offer.status] as any}>
                        {getStatusLabel(offer.status)}
                      </Badge>
                      <div className="text-right">
                        <p className="font-medium">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: offer.currency,
                          }).format(offer.total)}
                        </p>
                        <p className="text-xs text-muted-foreground">{offer.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{t("quickActions")}</CardTitle>
              <CardDescription>{t("quickActionsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/offers/new" className="block">
                <div className="flex items-center p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="p-2 rounded-lg bg-primary/10 mr-4">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{t("createNewOffer")}</p>
                    <p className="text-sm text-muted-foreground">{t("createNewOfferDesc")}</p>
                  </div>
                </div>
              </Link>
              <Link href="/dashboard/clients/new" className="block">
                <div className="flex items-center p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="p-2 rounded-lg bg-green-500/10 mr-4">
                    <Users className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">{t("addNewClient")}</p>
                    <p className="text-sm text-muted-foreground">{t("addNewClientDesc")}</p>
                  </div>
                </div>
              </Link>
              <Link href="/dashboard/templates" className="block">
                <div className="flex items-center p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="p-2 rounded-lg bg-purple-500/10 mr-4">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium">{t("manageTemplates")}</p>
                    <p className="text-sm text-muted-foreground">{t("manageTemplatesDesc")}</p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
