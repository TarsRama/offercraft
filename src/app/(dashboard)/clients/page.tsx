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
  Trash2,
  Building2,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data
const clients = [
  {
    id: "1",
    companyName: "Acme Corporation",
    email: "contact@acme.com",
    phone: "+1 234 567 890",
    status: "ACTIVE",
    offersCount: 5,
    totalValue: 125000,
    city: "New York",
  },
  {
    id: "2",
    companyName: "TechStart Inc",
    email: "hello@techstart.io",
    phone: "+1 345 678 901",
    status: "ACTIVE",
    offersCount: 3,
    totalValue: 45000,
    city: "San Francisco",
  },
  {
    id: "3",
    companyName: "BuildRight LLC",
    email: "info@buildright.com",
    phone: "+1 456 789 012",
    status: "ACTIVE",
    offersCount: 8,
    totalValue: 320000,
    city: "Chicago",
  },
  {
    id: "4",
    companyName: "Global Partners",
    email: "partners@global.com",
    phone: "+1 567 890 123",
    status: "LEAD",
    offersCount: 1,
    totalValue: 8500,
    city: "Boston",
  },
  {
    id: "5",
    companyName: "Industrial Co",
    email: "sales@industrial.co",
    phone: "+1 678 901 234",
    status: "INACTIVE",
    offersCount: 2,
    totalValue: 28000,
    city: "Detroit",
  },
];

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const t = useTranslations("clients");
  const tCommon = useTranslations("common");

  const statusConfig: Record<string, { label: string; variant: string }> = {
    LEAD: { label: t("status.lead"), variant: "outline" },
    ACTIVE: { label: t("status.active"), variant: "success" },
    INACTIVE: { label: t("status.inactive"), variant: "secondary" },
  };

  const filteredClients = clients.filter(
    (client) =>
      client.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
        <Link href="/dashboard/clients/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t("addClient")}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("searchClients")}
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

      {/* Clients Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((client, index) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(client.companyName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{client.companyName}</CardTitle>
                      <Badge variant={statusConfig[client.status].variant as any} className="mt-1">
                        {statusConfig[client.status].label}
                      </Badge>
                    </div>
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
                        {tCommon("viewDetails")}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        {tCommon("edit")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        {tCommon("delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 mr-2" />
                  {client.email}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 mr-2" />
                  {client.phone}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  {client.city}
                </div>
                <div className="pt-3 border-t flex justify-between text-sm">
                  <div>
                    <p className="text-muted-foreground">{t("offers")}</p>
                    <p className="font-medium">{client.offersCount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">{tCommon("totalValue")}</p>
                    <p className="font-medium">{formatCurrency(client.totalValue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">{t("noClients")}</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? t("noClientsSearch")
                : t("noClientsStart")}
            </p>
            {!searchQuery && (
              <Link href="/dashboard/clients/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("addClient")}
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
