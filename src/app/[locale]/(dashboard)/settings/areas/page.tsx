"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Users,
  Check,
  Building,
} from "lucide-react";

interface AreaItem {
  id: string;
  name: string;
  description: string;
  customerCount: number;
  assignedStaff: string;
}

const INITIAL_AREAS: AreaItem[] = [
  {
    id: "ar-1",
    name: "Main Market Route",
    description: "Shopkeepers and daily vendors along Market Main Road",
    customerCount: 34,
    assignedStaff: "Karthik Rajan",
  },
  {
    id: "ar-2",
    name: "North Ward",
    description: "Residential & small enterprise loans in North Extension",
    customerCount: 22,
    assignedStaff: "Karthik Rajan",
  },
  {
    id: "ar-3",
    name: "South Town",
    description: "Weekly collection cluster around South Bus Stand",
    customerCount: 19,
    assignedStaff: "Suresh Kumar",
  },
  {
    id: "ar-4",
    name: "East Bazaar",
    description: "Textile and wholesale merchant loans",
    customerCount: 15,
    assignedStaff: "Unassigned",
  },
];

export default function AreasSettingPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = (params.locale as string) || "en";

  const [areas, setAreas] = useState<AreaItem[]>(INITIAL_AREAS);
  const [newAreaName, setNewAreaName] = useState("");
  const [newAreaDesc, setNewAreaDesc] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaName.trim()) return;

    const newEntry: AreaItem = {
      id: `ar-${Date.now()}`,
      name: newAreaName.trim(),
      description: newAreaDesc.trim() || "Collection route",
      customerCount: 0,
      assignedStaff: "Unassigned",
    };

    setAreas([...areas, newEntry]);
    setNewAreaName("");
    setNewAreaDesc("");
  };

  const handleDeleteArea = (id: string) => {
    setAreas(areas.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <MapPin className="w-7 h-7 text-primary" />
            Collection Areas & Routes
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Organize daily/weekly collection routes for field staff (Vasool Drive style)
          </p>
        </div>
      </div>

      {/* Grid: Add Form + Area List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Add New Area */}
        <Card className="border-border/80 bg-card/80 backdrop-blur-sm h-fit">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              Add New Collection Area
            </CardTitle>
            <CardDescription>
              Create a route name to categorize borrowers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddArea} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="areaName" required>Area / Route Name</Label>
                <Input
                  id="areaName"
                  placeholder="e.g. South Bazaar Cluster"
                  value={newAreaName}
                  onChange={(e) => setNewAreaName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="areaDesc">Route Notes / Landmark</Label>
                <Input
                  id="areaDesc"
                  placeholder="e.g. Near New Bus Stand, Shops 1-50"
                  value={newAreaDesc}
                  onChange={(e) => setNewAreaDesc(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Add Area
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Col: Area Cards List */}
        <div className="lg:col-span-2 space-y-3">
          {areas.map((area) => (
            <div
              key={area.id}
              className="rounded-2xl border border-border/80 bg-card/80 backdrop-blur-sm p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-foreground">
                    {area.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {area.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      {area.customerCount} Borrowers
                    </span>
                    <span className="text-muted-foreground">
                      Agent: <strong className="text-foreground">{area.assignedStaff}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleDeleteArea(area.id)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  title="Delete Area"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
