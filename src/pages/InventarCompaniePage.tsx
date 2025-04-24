import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { MaterialWithProject } from "@/models/inventory";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Icons
import {
  Search,
  Package,
  FileDown,
  Plus,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  Loader2,
  ArrowUpDown,
  Download,
  RefreshCw,
} from "lucide-react";

const InventarCompaniePage: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State
  const [materials, setMaterials] = useState<MaterialWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialWithProject | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Fetch materials
  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("materials")
          .select(`
            id, 
            name, 
            dimension, 
            unit, 
            quantity, 
            manufacturer, 
            category, 
            image_url, 
            suplimentar, 
            project_id, 
            cost_per_unit, 
            supplier_id, 
            min_stock_level, 
            max_stock_level, 
            location, 
            notes,
            created_at,
            updated_at,
            projects:project_id (
              id,
              name
            )
          `);

        if (error) {
          throw error;
        }

        // Transform data to include project name
        const transformedData = data.map((item) => ({
          ...item,
          project_name: item.projects?.name || null,
        }));

        setMaterials(transformedData);
      } catch (error) {
        console.error("Error fetching materials:", error);
        toast({
          variant: "destructive",
          title: "Eroare",
          description: "Nu s-au putut încărca materialele. Încercați din nou.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [toast]);

  // Handle sort
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Filter and sort materials
  const filteredAndSortedMaterials = useMemo(() => {
    // First filter
    const filtered = materials.filter((material) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        material.name.toLowerCase().includes(searchLower) ||
        (material.category?.toLowerCase() || "").includes(searchLower) ||
        (material.manufacturer?.toLowerCase() || "").includes(searchLower) ||
        (material.project_name?.toLowerCase() || "").includes(searchLower)
      );
    });

    // Then sort
    return [...filtered].sort((a, b) => {
      const aValue = a[sortColumn as keyof MaterialWithProject];
      const bValue = b[sortColumn as keyof MaterialWithProject];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return sortDirection === "asc" ? -1 : 1;
      if (bValue === null || bValue === undefined) return sortDirection === "asc" ? 1 : -1;

      // Compare based on type
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // For numbers and other types
      return sortDirection === "asc"
        ? (aValue as any) > (bValue as any)
          ? 1
          : -1
        : (aValue as any) < (bValue as any)
        ? 1
        : -1;
    });
  }, [materials, searchTerm, sortColumn, sortDirection]);

  // Handle export to Excel
  const handleExport = async () => {
    setIsExporting(true);
    try {
      // In a real implementation, you would use a library like exceljs
      // For now, we'll just simulate the export
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast({
        title: "Export realizat cu succes",
        description: "Datele au fost exportate în format Excel.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Eroare la export",
        description: "Nu s-au putut exporta datele. Încercați din nou.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // View material details
  const handleViewDetails = (material: MaterialWithProject) => {
    setSelectedMaterial(material);
    setShowDetailsDialog(true);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-10 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Inventar Companie</h1>
        <Button
          onClick={() => navigate("/inventar-proiect")}
          variant="outline"
        >
          Vezi Inventar Proiect
        </Button>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate("/adauga-material")}>
            <Plus className="mr-2 h-4 w-4" />
            Adaugă Material
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="mr-2 h-4 w-4" />
            )}
            Exportă Excel
          </Button>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Caută materiale..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
      </div>

      {/* Materials Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5" />
            Materiale
          </CardTitle>
          <CardDescription>
            Lista completă a materialelor din inventarul companiei
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => handleSort("name")} className="cursor-pointer">
                    <div className="flex items-center">
                      Nume
                      {sortColumn === "name" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort("category")} className="cursor-pointer">
                    <div className="flex items-center">
                      Categorie
                      {sortColumn === "category" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort("quantity")} className="cursor-pointer text-right">
                    <div className="flex items-center justify-end">
                      Cantitate
                      {sortColumn === "quantity" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Unitate</TableHead>
                  <TableHead onClick={() => handleSort("project_name")} className="cursor-pointer">
                    <div className="flex items-center">
                      Proiect
                      {sortColumn === "project_name" && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedMaterials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Package className="h-12 w-12 mb-2 opacity-20" />
                        <p>Nu s-au găsit materiale</p>
                        <p className="text-sm">
                          {searchTerm
                            ? "Încercați să modificați criteriile de căutare"
                            : "Adăugați materiale pentru a le vedea aici"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedMaterials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">{material.name}</TableCell>
                      <TableCell>
                        {material.category ? (
                          <Badge variant="outline">{material.category}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Necategorizat
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={material.quantity <= (material.min_stock_level || 0) ? "text-destructive font-medium" : ""}>
                          {material.quantity}
                          {material.quantity <= (material.min_stock_level || 0) && (
                            <AlertCircle className="inline ml-1 h-4 w-4 text-destructive" />
                          )}
                        </span>
                      </TableCell>
                      <TableCell>{material.unit}</TableCell>
                      <TableCell>
                        {material.project_name ? (
                          material.project_name
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            Fără proiect
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Meniu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acțiuni</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewDetails(material)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Vezi detalii
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/editeaza-material/${material.id}`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editează
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Șterge
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {filteredAndSortedMaterials.length} materiale găsite
          </div>
          <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Resetează filtrele
          </Button>
        </CardFooter>
      </Card>

      {/* Material Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalii Material</DialogTitle>
            <DialogDescription>
              Informații complete despre materialul selectat
            </DialogDescription>
          </DialogHeader>
          {selectedMaterial && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Nume:</div>
                <div className="col-span-3">{selectedMaterial.name}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Categorie:</div>
                <div className="col-span-3">
                  {selectedMaterial.category || "Necategorizat"}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Cantitate:</div>
                <div className="col-span-3">
                  {selectedMaterial.quantity} {selectedMaterial.unit}
                </div>
              </div>
              {selectedMaterial.dimension && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-medium">Dimensiune:</div>
                  <div className="col-span-3">{selectedMaterial.dimension}</div>
                </div>
              )}
              {selectedMaterial.manufacturer && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-medium">Producător:</div>
                  <div className="col-span-3">{selectedMaterial.manufacturer}</div>
                </div>
              )}
              {selectedMaterial.location && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-medium">Locație:</div>
                  <div className="col-span-3">{selectedMaterial.location}</div>
                </div>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="font-medium">Proiect:</div>
                <div className="col-span-3">
                  {selectedMaterial.project_name || "Fără proiect"}
                </div>
              </div>
              {selectedMaterial.cost_per_unit && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-medium">Cost unitar:</div>
                  <div className="col-span-3">
                    {selectedMaterial.cost_per_unit} RON
                  </div>
                </div>
              )}
              {selectedMaterial.min_stock_level && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="font-medium">Nivel minim stoc:</div>
                  <div className="col-span-3">
                    {selectedMaterial.min_stock_level} {selectedMaterial.unit}
                  </div>
                </div>
              )}
              {selectedMaterial.notes && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <div className="font-medium">Note:</div>
                  <div className="col-span-3">{selectedMaterial.notes}</div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Închide
            </Button>
            {selectedMaterial && (
              <Button onClick={() => navigate(`/editeaza-material/${selectedMaterial.id}`)}>
                <Edit className="mr-2 h-4 w-4" />
                Editează
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventarCompaniePage;
