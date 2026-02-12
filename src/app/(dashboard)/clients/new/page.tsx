"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { 
  Plus, 
  X, 
  Save,
  ArrowLeft,
  Building2,
  User,
  MapPin,
  Phone,
  Mail,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  isPrimary: boolean;
}

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  type: "BILLING" | "SHIPPING" | "PROJECT";
  isPrimary: boolean;
}

export default function NewClientPage() {
  const router = useRouter();
  const t = useTranslations("clients");
  const tCommon = useTranslations("common");
  
  const [isLoading, setIsLoading] = useState(false);
  const [client, setClient] = useState({
    companyName: "",
    vatNumber: "",
    email: "",
    phone: "",
    website: "",
    notes: "",
    status: "LEAD" as const,
  });
  
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: "contact-1",
      name: "",
      email: "",
      phone: "",
      position: "",
      isPrimary: true,
    }
  ]);

  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: "address-1",
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      type: "BILLING",
      isPrimary: true,
    }
  ]);

  const addContact = () => {
    const newContact: Contact = {
      id: `contact-${Date.now()}`,
      name: "",
      email: "",
      phone: "",
      position: "",
      isPrimary: false,
    };
    setContacts([...contacts, newContact]);
  };

  const updateContact = (contactId: string, field: keyof Contact, value: any) => {
    setContacts(contacts.map(contact => 
      contact.id === contactId ? { ...contact, [field]: value } : contact
    ));
  };

  const removeContact = (contactId: string) => {
    if (contacts.length > 1) {
      setContacts(contacts.filter(contact => contact.id !== contactId));
    }
  };

  const setPrimaryContact = (contactId: string) => {
    setContacts(contacts.map(contact => ({
      ...contact,
      isPrimary: contact.id === contactId
    })));
  };

  const addAddress = () => {
    const newAddress: Address = {
      id: `address-${Date.now()}`,
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      type: "SHIPPING",
      isPrimary: false,
    };
    setAddresses([...addresses, newAddress]);
  };

  const updateAddress = (addressId: string, field: keyof Address, value: any) => {
    setAddresses(addresses.map(address => 
      address.id === addressId ? { ...address, [field]: value } : address
    ));
  };

  const removeAddress = (addressId: string) => {
    if (addresses.length > 1) {
      setAddresses(addresses.filter(address => address.id !== addressId));
    }
  };

  const setPrimaryAddress = (addressId: string) => {
    setAddresses(addresses.map(address => ({
      ...address,
      isPrimary: address.id === addressId
    })));
  };

  const handleSave = async () => {
    if (!client.companyName) {
      toast.error("Company name is required");
      return;
    }

    setIsLoading(true);

    try {
      const clientData = {
        ...client,
        contacts: contacts.filter(contact => contact.name.trim() !== ""),
        addresses: addresses.filter(address => address.street.trim() !== ""),
      };

      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        throw new Error("Failed to create client");
      }

      const data = await response.json();
      toast.success("Client created successfully");
      router.push("/dashboard/clients");
    } catch (error: any) {
      toast.error(error.message || "Failed to create client");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("addClient")}</h1>
          <p className="text-muted-foreground">Add a new client to your system</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>Basic company details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    placeholder="Acme Corporation"
                    value={client.companyName}
                    onChange={(e) => setClient({ ...client, companyName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vatNumber">VAT Number</Label>
                  <Input
                    id="vatNumber"
                    placeholder="GB123456789"
                    value={client.vatNumber}
                    onChange={(e) => setClient({ ...client, vatNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="info@company.com"
                    value={client.email}
                    onChange={(e) => setClient({ ...client, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={client.phone}
                    onChange={(e) => setClient({ ...client, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    placeholder="https://company.com"
                    value={client.website}
                    onChange={(e) => setClient({ ...client, website: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={client.status} onValueChange={(value: any) => setClient({ ...client, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LEAD">Lead</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  className="w-full min-h-[100px] p-3 border rounded-md"
                  placeholder="Additional notes about the client..."
                  value={client.notes}
                  onChange={(e) => setClient({ ...client, notes: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Persons */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Contact Persons
                  </CardTitle>
                  <CardDescription>Add contact persons for this client</CardDescription>
                </div>
                <Button onClick={addContact} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {contacts.map((contact, index) => (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Contact {index + 1}</span>
                      {contact.isPrimary && (
                        <Badge variant="default" className="text-xs">Primary</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!contact.isPrimary && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPrimaryContact(contact.id)}
                        >
                          Set Primary
                        </Button>
                      )}
                      {contacts.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeContact(contact.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs">Name</Label>
                      <Input
                        placeholder="John Doe"
                        value={contact.name}
                        onChange={(e) => updateContact(contact.id, "name", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Position</Label>
                      <Input
                        placeholder="Project Manager"
                        value={contact.position}
                        onChange={(e) => updateContact(contact.id, "position", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Email</Label>
                      <Input
                        type="email"
                        placeholder="john@company.com"
                        value={contact.email}
                        onChange={(e) => updateContact(contact.id, "email", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Phone</Label>
                      <Input
                        placeholder="+1 (555) 123-4567"
                        value={contact.phone}
                        onChange={(e) => updateContact(contact.id, "phone", e.target.value)}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Addresses
                  </CardTitle>
                  <CardDescription>Add billing and shipping addresses</CardDescription>
                </div>
                <Button onClick={addAddress} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Address
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {addresses.map((address, index) => (
                <motion.div
                  key={address.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {address.type.charAt(0) + address.type.slice(1).toLowerCase()} Address
                      </span>
                      {address.isPrimary && (
                        <Badge variant="default" className="text-xs">Primary</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!address.isPrimary && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPrimaryAddress(address.id)}
                        >
                          Set Primary
                        </Button>
                      )}
                      {addresses.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeAddress(address.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Address Type</Label>
                      <Select
                        value={address.type}
                        onValueChange={(value: any) => updateAddress(address.id, "type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BILLING">Billing</SelectItem>
                          <SelectItem value="SHIPPING">Shipping</SelectItem>
                          <SelectItem value="PROJECT">Project Site</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">Street Address</Label>
                      <Input
                        placeholder="123 Main Street"
                        value={address.street}
                        onChange={(e) => updateAddress(address.id, "street", e.target.value)}
                      />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <Label className="text-xs">City</Label>
                        <Input
                          placeholder="New York"
                          value={address.city}
                          onChange={(e) => updateAddress(address.id, "city", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">State/Province</Label>
                        <Input
                          placeholder="NY"
                          value={address.state}
                          onChange={(e) => updateAddress(address.id, "state", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">ZIP/Postal Code</Label>
                        <Input
                          placeholder="10001"
                          value={address.zipCode}
                          onChange={(e) => updateAddress(address.id, "zipCode", e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Country</Label>
                      <Input
                        placeholder="United States"
                        value={address.country}
                        onChange={(e) => updateAddress(address.id, "country", e.target.value)}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{tCommon("actions")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {tCommon("save")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}