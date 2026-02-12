"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash2, Copy, Eye, FileText } from "lucide-react";
import { toast } from "sonner";

interface OfferTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  sections: any[];
  terms?: string;
  validityDays: number;
  createdAt: string;
}

export default function OfferTemplatesPage() {
  const [templates, setTemplates] = useState<OfferTemplate[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<OfferTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<OfferTemplate | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    terms: "",
    validityDays: "30",
  });

  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory, searchTerm]);

  const fetchTemplates = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/templates/offers?${params}`);
      if (!response.ok) throw new Error("Failed to fetch templates");
      
      const data = await response.json();
      setTemplates(data.templates);
      setCategories(data.categories);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load offer templates");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingTemplate 
        ? `/api/templates/offers/${editingTemplate.id}`
        : "/api/templates/offers";
      
      const method = editingTemplate ? "PUT" : "POST";
      
      const payload = editingTemplate 
        ? formData
        : { ...formData, sections: [] }; // New templates start empty

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save template");

      toast.success(editingTemplate ? "Template updated" : "Template created");
      setIsDialogOpen(false);
      resetForm();
      fetchTemplates();
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("Failed to save template");
    }
  };

  const handleEdit = (template: OfferTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || "",
      category: template.category || "",
      terms: template.terms || "",
      validityDays: template.validityDays.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    
    try {
      const response = await fetch(`/api/templates/offers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete template");

      toast.success("Template deleted");
      fetchTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("Failed to delete template");
    }
  };

  const handleDuplicate = async (template: OfferTemplate) => {
    try {
      const response = await fetch("/api/templates/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${template.name} (Copy)`,
          description: template.description,
          category: template.category,
          sections: template.sections,
          terms: template.terms,
          validityDays: template.validityDays,
        }),
      });

      if (!response.ok) throw new Error("Failed to duplicate template");

      toast.success("Template duplicated");
      fetchTemplates();
    } catch (error) {
      console.error("Error duplicating template:", error);
      toast.error("Failed to duplicate template");
    }
  };

  const handleCreateFromTemplate = async (template: OfferTemplate) => {
    // This would redirect to the offer creation page with template pre-loaded
    window.location.href = `/dashboard/offers/new?template=${template.id}`;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      terms: "",
      validityDays: "30",
    });
    setEditingTemplate(null);
  };

  const getSectionsSummary = (sections: any[]) => {
    if (!sections || sections.length === 0) return "No sections";
    const totalArticles = sections.reduce((sum, section) => 
      sum + (section.articles?.length || 0), 0);
    return `${sections.length} section${sections.length !== 1 ? 's' : ''}, ${totalArticles} article${totalArticles !== 1 ? 's' : ''}`;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Offer Templates</h1>
          <p className="text-muted-foreground">
            Create and manage offer templates for consistent proposals
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  {template.category && (
                    <Badge variant="secondary" className="mt-1">
                      {template.category}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewTemplate(template)}
                    title="Preview"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(template)}
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDuplicate(template)}
                    title="Duplicate"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                    className="text-destructive hover:text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {template.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {template.description}
                </p>
              )}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Content:</span>
                  <span className="font-medium">{getSectionsSummary(template.sections)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Validity:</span>
                  <span className="font-medium">{template.validityDays} days</span>
                </div>
              </div>
              <Button
                className="w-full mt-4"
                variant="outline"
                onClick={() => handleCreateFromTemplate(template)}
              >
                <FileText className="mr-2 h-4 w-4" />
                Create Offer
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-muted-foreground">
              No offer templates found. Create your first template to get started.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Create New Template"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name*</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Website Development Template"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Brief description of this template..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Web, Consulting"
                />
              </div>
              <div>
                <Label htmlFor="validityDays">Validity (days)*</Label>
                <Input
                  id="validityDays"
                  type="number"
                  min="1"
                  value={formData.validityDays}
                  onChange={(e) => setFormData({ ...formData, validityDays: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="terms">Default Terms & Conditions</Label>
              <Textarea
                id="terms"
                value={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                rows={4}
                placeholder="Standard terms and conditions for this type of offer..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingTemplate ? "Update" : "Create"} Template
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      {previewTemplate && (
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{previewTemplate.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {previewTemplate.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{previewTemplate.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Category</h4>
                  <Badge variant="outline">{previewTemplate.category || "Uncategorized"}</Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Validity Period</h4>
                  <p className="text-sm">{previewTemplate.validityDays} days</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Content Structure</h4>
                <div className="text-sm space-y-2">
                  {previewTemplate.sections && previewTemplate.sections.length > 0 ? (
                    previewTemplate.sections.map((section: any, index: number) => (
                      <div key={index} className="border rounded p-3">
                        <div className="font-medium">{section.title}</div>
                        {section.description && (
                          <div className="text-muted-foreground text-xs mt-1">{section.description}</div>
                        )}
                        {section.articles && (
                          <div className="text-xs mt-2 text-muted-foreground">
                            {section.articles.length} article{section.articles.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No content sections defined</p>
                  )}
                </div>
              </div>

              {previewTemplate.terms && (
                <div>
                  <h4 className="font-medium mb-2">Terms & Conditions</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {previewTemplate.terms}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}