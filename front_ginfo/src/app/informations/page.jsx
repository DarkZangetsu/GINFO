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
import { Checkbox } from "@/components/ui/checkbox";
import { toast, Toaster } from "sonner";
import { PlusCircle, Pencil, Trash2, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

// GraphQL Queries et Mutations
const GET_INFORMATIONS = gql`
  query Informations {
    informations {
      informationId
      numeroEmploye
      adresse
      numeroAssurance
      cin
      statut
    }
  }
`;

const GET_INFORMATION_BY_ID = gql`
  query InformationById($id: ID!) {
    informationById(id: $id) {
      informationId
      numeroEmploye
      adresse
      numeroAssurance
      cin
      statut
    }
  }
`;

const CREATE_INFORMATION = gql`
  mutation CreateInformation($informationData: InformationInput!) {
    createInformation(informationData: $informationData) {
      information {
        informationId
        numeroEmploye
        adresse
        numeroAssurance
        cin
        statut
      }
    }
  }
`;

const UPDATE_INFORMATION = gql`
  mutation UpdateInformation($id: ID!, $informationData: InformationInput!) {
    updateInformation(id: $id, informationData: $informationData) {
      information {
        informationId
        numeroEmploye
        adresse
        numeroAssurance
        cin
        statut
      }
    }
  }
`;

const DELETE_INFORMATION = gql`
  mutation DeleteInformation($id: ID!) {
    deleteInformation(id: $id) {
      success
    }
  }
`;

export default function InformationsPage() {
  const router = useRouter();
  const { data, loading, error, refetch } = useQuery(GET_INFORMATIONS);
  const [createInformation] = useMutation(CREATE_INFORMATION);
  const [updateInformation] = useMutation(UPDATE_INFORMATION);
  const [deleteInformation] = useMutation(DELETE_INFORMATION);

  // États pour gérer les dialogues et modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentInformation, setCurrentInformation] = useState(null);
  const [userId, setUserId] = useState(null);
  const [formData, setFormData] = useState({
    numeroEmploye: "",
    adresse: "",
    numeroAssurance: "",
    cin: "",
    statut: false 
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
      // Décoder le token pour récupérer l'ID de l'utilisateur
      const decoded = jwtDecode(token);
      setUserId(decoded.userId || decoded.sub || decoded.id);
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

  const handleStatusChange = (checked) => {
    setFormData(prev => ({ ...prev, statut: checked }));
  };


  const openCreateModal = () => {
    setFormData({
      numeroEmploye: "",
      adresse: "",
      numeroAssurance: "",
      cin: "",
      statut: false 
    });
    setIsCreateModalOpen(true);
  };

  // Ouvrir le modal d'édition
  const openEditModal = (information) => {
    setCurrentInformation(information);
    setFormData({
      numeroEmploye: information.numeroEmploye || "",
      adresse: information.adresse || "",
      numeroAssurance: information.numeroAssurance || "",
      cin: information.cin || "",
      statut: Boolean(information.statut) 
    });
    setIsEditModalOpen(true);
  };

  // Ouvrir le dialogue de confirmation de suppression
  const openDeleteDialog = (information) => {
    setCurrentInformation(information);
    setIsDeleteDialogOpen(true);
  };

  // Soumission du formulaire de création
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error("Utilisateur non identifié", {
        description: "Impossible de créer l'information."
      });
      return;
    }
  
    // Ajoutez des logs pour voir ce qui est envoyé
    console.log("FormData avant envoi:", formData);
    console.log("UserID:", userId);
  
    try {
      // Structure exactement comme dans votre exemple Postman qui fonctionne
      const informationInput = {
        utilisateurId: userId,
        numeroEmploye: formData.numeroEmploye,
        adresse: formData.adresse,
        numeroAssurance: formData.numeroAssurance,
        cin: formData.cin,
        statut: formData.statut
      };
  
      console.log("Structure finale envoyée:", informationInput);
  
      const response = await createInformation({
        variables: {
          informationData: informationInput
        }
      });
  
      console.log("Réponse de création:", response);
      setIsCreateModalOpen(false);
      refetch();
      toast.success("Information créée", {
        description: "L'information a été créée avec succès."
      });
    } catch (error) {
      console.error("Erreur détaillée lors de la création:", error);
      // Afficher plus de détails sur l'erreur
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
        description: "Impossible de modifier l'information."
      });
      return;
    }
  
    console.log("FormData pour édition:", formData);
    console.log("Information ID:", currentInformation.informationId);
  
    try {
      const informationInput = {
        utilisateurId: userId,
        numeroEmploye: formData.numeroEmploye,
        adresse: formData.adresse,
        numeroAssurance: formData.numeroAssurance,
        cin: formData.cin,
        statut: formData.statut
      };
  
      console.log("Structure finale pour mise à jour:", informationInput);
  
      const response = await updateInformation({
        variables: {
          id: currentInformation.informationId,
          informationData: informationInput
        }
      });
  
      console.log("Réponse de mise à jour:", response);
      setIsEditModalOpen(false);
      refetch();
      toast.success("Information mise à jour", {
        description: "L'information a été mise à jour avec succès."
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
      await deleteInformation({
        variables: {
          id: currentInformation.informationId
        }
      });
      setIsDeleteDialogOpen(false);
      refetch();
      toast.success("Information supprimée", {
        description: "L'information a été supprimée avec succès."
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
                  <BreadcrumbPage>Informations</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Gestion des Informations</h1>
            <Button onClick={openCreateModal}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter une information
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Chargement des informations...</p>
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
                    <TableHead>N° Employé</TableHead>
                    <TableHead>Adresse</TableHead>
                    <TableHead>N° Assurance</TableHead>
                    <TableHead>CIN</TableHead>
                    <TableHead>Vérifié</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.informations.length > 0 ? (
                    data.informations.map((info) => (
                      <TableRow key={info.informationId}>
                        <TableCell>{info.numeroEmploye}</TableCell>
                        <TableCell>{info.adresse}</TableCell>
                        <TableCell>{info.numeroAssurance}</TableCell>
                        <TableCell>{info.cin}</TableCell>
                        <TableCell>
                          {Boolean(info.statut) ? (
                            <div className="flex items-center">
                              <Check className="h-5 w-5 text-green-500" />
                              <span className="ml-2">Oui</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <X className="h-5 w-5 text-red-500" />
                              <span className="ml-2">Non</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditModal(info)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500"
                            onClick={() => openDeleteDialog(info)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                        Aucune information trouvée
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
            <DialogTitle>Ajouter une information</DialogTitle>
            <DialogDescription>
              Remplissez le formulaire pour ajouter une nouvelle information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="numeroEmploye" className="text-right">
                  N° Employé
                </Label>
                <Input
                  id="numeroEmploye"
                  name="numeroEmploye"
                  value={formData.numeroEmploye}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="adresse" className="text-right">
                  Adresse
                </Label>
                <Input
                  id="adresse"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="numeroAssurance" className="text-right">
                  N° Assurance
                </Label>
                <Input
                  id="numeroAssurance"
                  name="numeroAssurance"
                  value={formData.numeroAssurance}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cin" className="text-right">
                  CIN
                </Label>
                <Input
                  id="cin"
                  name="cin"
                  value={formData.cin}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="statut" className="text-right">
                  Vérifié
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Checkbox 
                    id="statut" 
                    checked={formData.statut} 
                    onCheckedChange={handleStatusChange}
                  />
                  <label 
                    htmlFor="statut" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Information vérifiée
                  </label>
                </div>
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
            <DialogTitle>Modifier l'information</DialogTitle>
            <DialogDescription>
              Modifiez les informations existantes.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="numeroEmploye" className="text-right">
                  N° Employé
                </Label>
                <Input
                  id="numeroEmploye"
                  name="numeroEmploye"
                  value={formData.numeroEmploye}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="adresse" className="text-right">
                  Adresse
                </Label>
                <Input
                  id="adresse"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="numeroAssurance" className="text-right">
                  N° Assurance
                </Label>
                <Input
                  id="numeroAssurance"
                  name="numeroAssurance"
                  value={formData.numeroAssurance}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cin" className="text-right">
                  CIN
                </Label>
                <Input
                  id="cin"
                  name="cin"
                  value={formData.cin}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="statut-edit" className="text-right">
                  Vérifié
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Checkbox 
                    id="statut-edit" 
                    checked={formData.statut} 
                    onCheckedChange={handleStatusChange}
                  />
                  <label 
                    htmlFor="statut-edit" 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Information vérifiée
                  </label>
                </div>
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
              Cette action ne peut pas être annulée. Cette information sera supprimée définitivement.
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