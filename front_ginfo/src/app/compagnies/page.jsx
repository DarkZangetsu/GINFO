"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "sonner";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { CREATE_COMPAGNIE, DELETE_COMPAGNIE, GET_COMPAGNIES, UPDATE_COMPAGNIE } from "@/query/compagnie";


export default function CompagniesAssurancePage() {
  const router = useRouter();
  const { data, loading, error, refetch } = useQuery(GET_COMPAGNIES);
  const [createCompagnie] = useMutation(CREATE_COMPAGNIE);
  const [updateCompagnie] = useMutation(UPDATE_COMPAGNIE);
  const [deleteCompagnie] = useMutation(DELETE_COMPAGNIE);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCompagnie, setCurrentCompagnie] = useState(null);
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    nomCompagnie: "",
    adresseCompagnie: "",
    emailCompagnie: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vous devez être connecté", {
        description: "Redirection vers la page de connexion..."
      });
      setTimeout(() => {
        router.push("/login");
      }, 2000);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUserId(decoded.utilisateurId || decoded.sub || decoded.id);
    } catch (error) {
      console.error("Erreur lors du décodage du token:", error);
      toast.error("Session invalide", {
        description: "Veuillez vous reconnecter."
      });
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setFormData({
      nomCompagnie: "",
      adresseCompagnie: "",
      emailCompagnie: ""
    });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (compagnie) => {
    setCurrentCompagnie(compagnie);
    setFormData({
      nomCompagnie: compagnie.nomCompagnie || "",
      adresseCompagnie: compagnie.adresseCompagnie || "",
      emailCompagnie: compagnie.emailCompagnie || ""
    });
    setIsEditModalOpen(true);
  };

  // Ouvrir le dialogue de confirmation de suppression
  const openDeleteDialog = (compagnie) => {
    setCurrentCompagnie(compagnie);
    setIsDeleteDialogOpen(true);
  };

  // Soumission du formulaire de création
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error("Utilisateur non identifié", {
        description: "Impossible de créer la compagnie d'assurance."
      });
      return;
    }
  
    console.log("FormData avant envoi:", formData);
  
    try {
      const compagnieInput = {
        nomCompagnie: formData.nomCompagnie,
        adresseCompagnie: formData.adresseCompagnie,
        emailCompagnie: formData.emailCompagnie
      };
  
      console.log("Structure finale envoyée:", compagnieInput);
  
      const response = await createCompagnie({
        variables: {
          compagnieData: compagnieInput
        }
      });
  
      console.log("Réponse de création:", response);
      setIsCreateModalOpen(false);
      refetch();
      toast.success("Compagnie créée", {
        description: "La compagnie d'assurance a été créée avec succès."
      });
    } catch (error) {
      console.error("Erreur détaillée lors de la création:", error);
      const errorMessage = error.graphQLErrors?.[0]?.message || error.message;
      toast.error("Erreur", {
        description: `Une erreur est survenue: ${errorMessage}`
      });
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error("Utilisateur non identifié", {
        description: "Impossible de modifier la compagnie d'assurance."
      });
      return;
    }
  
    console.log("FormData pour édition:", formData);
    console.log("Compagnie ID:", currentCompagnie.compagnieId);
  
    try {
      const compagnieInput = {
        nomCompagnie: formData.nomCompagnie,
        adresseCompagnie: formData.adresseCompagnie,
        emailCompagnie: formData.emailCompagnie
      };
  
      console.log("Structure finale pour mise à jour:", compagnieInput);
  
      const response = await updateCompagnie({
        variables: {
          id: currentCompagnie.compagnieId,
          compagnieData: compagnieInput
        }
      });
  
      console.log("Réponse de mise à jour:", response);
      setIsEditModalOpen(false);
      refetch();
      toast.success("Compagnie mise à jour", {
        description: "La compagnie d'assurance a été mise à jour avec succès."
      });
    } catch (error) {
      console.error("Erreur détaillée lors de la mise à jour:", error);
      const errorMessage = error.graphQLErrors?.[0]?.message || error.message;
      toast.error("Erreur", {
        description: `Une erreur est survenue: ${errorMessage}`
      });
    }
  };

  // Confirmer la suppression
  const handleDelete = async () => {
    try {
      await deleteCompagnie({
        variables: {
          id: currentCompagnie.compagnieId
        }
      });
      setIsDeleteDialogOpen(false);
      refetch();
      toast.success("Compagnie supprimée", {
        description: "La compagnie d'assurance a été supprimée avec succès."
      });
    } catch (error) {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la suppression."
      });
      console.error("Erreur lors de la suppression:", error);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Compagnies d'assurance</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Gestion des Compagnies d'Assurance</h1>
            <Button onClick={openCreateModal}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter une compagnie
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Chargement des compagnies d'assurance...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-red-500">Erreur: {error.message}</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom de la compagnie</TableHead>
                    <TableHead>Adresse</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.compagnies.length > 0 ? (
                    data.compagnies.map((compagnie) => (
                      <TableRow key={compagnie.compagnieId}>
                        <TableCell>{compagnie.nomCompagnie}</TableCell>
                        <TableCell>{compagnie.adresseCompagnie}</TableCell>
                        <TableCell>{compagnie.emailCompagnie}</TableCell>
                        <TableCell className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditModal(compagnie)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500"
                            onClick={() => openDeleteDialog(compagnie)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">
                        Aucune compagnie d'assurance trouvée
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </SidebarInset>

      {/* Modal de création */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter une compagnie d'assurance</DialogTitle>
            <DialogDescription>
              Remplissez le formulaire pour ajouter une nouvelle compagnie d'assurance.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nomCompagnie" className="text-right">
                  Nom de la compagnie
                </Label>
                <Input
                  id="nomCompagnie"
                  name="nomCompagnie"
                  value={formData.nomCompagnie}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="adresseCompagnie" className="text-right">
                  Adresse
                </Label>
                <Input
                  id="adresseCompagnie"
                  name="adresseCompagnie"
                  value={formData.adresseCompagnie}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="emailCompagnie" className="text-right">
                  Email
                </Label>
                <Input
                  id="emailCompagnie"
                  name="emailCompagnie"
                  type="email"
                  value={formData.emailCompagnie}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Créer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal d'édition */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier la compagnie d'assurance</DialogTitle>
            <DialogDescription>
              Modifiez les informations de la compagnie d'assurance.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nomCompagnie" className="text-right">
                  Nom de la compagnie
                </Label>
                <Input
                  id="nomCompagnie"
                  name="nomCompagnie"
                  value={formData.nomCompagnie}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="adresseCompagnie" className="text-right">
                  Adresse
                </Label>
                <Input
                  id="adresseCompagnie"
                  name="adresseCompagnie"
                  value={formData.adresseCompagnie}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="emailCompagnie" className="text-right">
                  Email
                </Label>
                <Input
                  id="emailCompagnie"
                  name="emailCompagnie"
                  type="email"
                  value={formData.emailCompagnie}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Mettre à jour</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cette compagnie d'assurance sera supprimée définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Toaster richColors position="top-center" />
    </SidebarProvider>
  );
}