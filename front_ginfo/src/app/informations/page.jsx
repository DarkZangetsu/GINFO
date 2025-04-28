"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast, Toaster } from "sonner";
import { PlusCircle, Pencil, Trash2, Check, X, Mail, User, Building, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { CREATE_INFORMATION, DELETE_INFORMATION, GET_INFORMATIONS, UPDATE_INFORMATION } from "@/query/information";

import { GET_UTILISATEURS } from "@/query/utilisateur";
import { GET_COMPAGNIES } from "@/query/compagnie";

export default function InformationsPage() {
  const router = useRouter();
  const { data, loading, error, refetch } = useQuery(GET_INFORMATIONS);
  const { data: utilisateursData, loading: loadingUtilisateurs } = useQuery(GET_UTILISATEURS);
  const { data: compagnieData, loading: loadingCompagnie } = useQuery(GET_COMPAGNIES);

  const [createInformation] = useMutation(CREATE_INFORMATION);
  const [updateInformation] = useMutation(UPDATE_INFORMATION);
  const [deleteInformation] = useMutation(DELETE_INFORMATION);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentInformation, setCurrentInformation] = useState(null);
  const [userId, setUserId] = useState(null);

  // Formdata avec les noms de champs correspondant au backend
  const [formData, setFormData] = useState({
    utilisateurId: "",
    compagnieId: "", // Renommé pour correspondre à l'API
    numeroEmploye: "",
    adresse: "",
    numeroAssurance: "",
    cin: "",
    emailNotification: "",
    statut: false
  });

  // État pour stocker les détails de l'employé actuel en mode édition
  const [currentEmploye, setCurrentEmploye] = useState({
    nom: "",
    prenom: "",
    email: ""
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

  // Gestionnaire pour le changement d'utilisateur dans le Select
  const handleUtilisateurChange = (value) => {
    setFormData(prev => ({ ...prev, utilisateurId: value }));
  };

  // Gestionnaire pour le changement de compagnie dans le Select
  const handleCompagnieChange = (value) => {
    setFormData(prev => ({ ...prev, compagnieId: value })); // Modifié ici
  };

  const handleStatusChange = (checked) => {
    setFormData(prev => ({ ...prev, statut: checked }));
  };

  const openCreateModal = () => {
    setFormData({
      utilisateurId: "",
      compagnieId: "", // Modifié ici
      numeroEmploye: "",
      adresse: "",
      numeroAssurance: "",
      cin: "",
      emailNotification: "",
      statut: false
    });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (information) => {
    setCurrentInformation(information);

    console.log("Structure information:", information);

    const compagnieId = information.compagnieId ?
      (typeof information.compagnieId === 'object' ?
        information.compagnieId.compagnieId : information.compagnieId) : "";

    setFormData({
      utilisateurId: information.utilisateur?.utilisateurId || "",
      compagnieId: compagnieId,
      numeroEmploye: information.numeroEmploye || "",
      adresse: information.adresse || "",
      numeroAssurance: information.numeroAssurance || "",
      cin: information.cin || "",
      emailNotification: information.emailNotification || "",
      statut: Boolean(information.statut)
    });

    if (information.utilisateur) {
      setCurrentEmploye({
        nom: information.utilisateur.nom || "",
        prenom: information.utilisateur.prenom || "",
        email: information.utilisateur.email || ""
      });
    }

    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (information) => {
    setCurrentInformation(information);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    if (!formData.utilisateurId) {
      toast.error("Erreur", {
        description: "Veuillez sélectionner un utilisateur."
      });
      return;
    }

    try {
      const informationInput = {
        utilisateurId: formData.utilisateurId,
        compagnieId: formData.compagnieId,
        numeroEmploye: formData.numeroEmploye,
        adresse: formData.adresse,
        numeroAssurance: formData.numeroAssurance,
        cin: formData.cin,
        emailNotification: formData.emailNotification,
        statut: formData.statut
      };

      const response = await createInformation({
        variables: {
          informationData: informationInput
        }
      });

      setIsCreateModalOpen(false);
      refetch();
      toast.success("Information créée", {
        description: "L'information a été créée avec succès."
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

    if (!formData.utilisateurId) {
      toast.error("Erreur", {
        description: "L'identifiant de l'utilisateur est manquant."
      });
      return;
    }

    try {
      const informationInput = {
        utilisateurId: formData.utilisateurId,
        compagnieId: formData.compagnieId,
        numeroEmploye: formData.numeroEmploye,
        adresse: formData.adresse,
        numeroAssurance: formData.numeroAssurance,
        cin: formData.cin,
        emailNotification: formData.emailNotification,
        statut: formData.statut
      };

      const response = await updateInformation({
        variables: {
          id: currentInformation.informationId,
          informationData: informationInput
        }
      });

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
                    <TableHead>Employé</TableHead>
                    <TableHead>N° Employé</TableHead>
                    <TableHead>Adresse</TableHead>
                    <TableHead>Compagnie d'Assurance</TableHead>
                    <TableHead>N° Assurance</TableHead>
                    <TableHead>CIN</TableHead>
                    <TableHead>Email notification</TableHead>
                    <TableHead>Vérifié</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.informations.length > 0 ? (
                    data.informations.map((info) => (
                      <TableRow key={info.informationId}>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-gray-500" />
                            {info.utilisateur ? `${info.utilisateur.prenom} ${info.utilisateur.nom}` : "Non assigné"}
                          </div>
                        </TableCell>
                        <TableCell>{info.numeroEmploye}</TableCell>
                        <TableCell>{info.adresse}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-2 text-gray-500" />
                            {info.compagnieId ? info.compagnieId.nom : "Non définie"}
                          </div>
                        </TableCell>
                        <TableCell>{info.numeroAssurance}</TableCell>
                        <TableCell>{info.cin}</TableCell>
                        <TableCell>
                          {info.emailNotification ? (
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2 text-blue-500" />
                              {info.emailNotification}
                            </div>
                          ) : (
                            <span className="text-gray-400">Non défini</span>
                          )}
                        </TableCell>
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
                      <TableCell colSpan={9} className="text-center h-24">
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
              {/* Sélection de l'utilisateur */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="utilisateur" className="text-right">
                  Employé
                </Label>
                <div className="col-span-3">
                  <Select
                    value={formData.utilisateurId || ""}
                    onValueChange={handleUtilisateurChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un employé" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingUtilisateurs ? (
                        <SelectItem value="" disabled>Chargement...</SelectItem>
                      ) : utilisateursData?.utilisateurs?.length > 0 ? (
                        utilisateursData.utilisateurs.map((utilisateur) => (
                          <SelectItem key={utilisateur.utilisateurId} value={utilisateur.utilisateurId}>
                            {utilisateur.prenom} {utilisateur.nom}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>Aucun utilisateur disponible</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
              {/* Sélection de la compagnie d'assurance */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="compagnie" className="text-right">
                  Compagnie d'Assurance
                </Label>
                <div className="col-span-3">
                  <Select
                    value={formData.compagnieId || ""}
                    onValueChange={handleCompagnieChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une compagnie" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingCompagnie ? (
                        <SelectItem value="" disabled>Chargement...</SelectItem>
                      ) : compagnieData?.compagnies?.length > 0 ? (
                        compagnieData.compagnies.map((compagnie) => (
                          <SelectItem key={compagnie.compagnieId} value={compagnie.compagnieId}>
                            {compagnie.nomCompagnie || compagnie.nom}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>Aucune compagnie disponible</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
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
                <Label htmlFor="emailNotification" className="text-right">
                  Email notification
                </Label>
                <Input
                  id="emailNotification"
                  name="emailNotification"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.emailNotification}
                  onChange={handleChange}
                  className="col-span-3"
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
              {/* Affichage de l'employé non modifiable */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="utilisateur-display" className="text-right">
                  Employé
                </Label>
                <div className="col-span-3">
                  <div className="flex items-center border rounded-md px-3 py-2 bg-gray-50">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    {currentEmploye.prenom && currentEmploye.nom ? (
                      <span className="text-sm">{currentEmploye.prenom} {currentEmploye.nom}</span>
                    ) : (
                      <span className="text-sm text-gray-400">Employé non sélectionné</span>
                    )}
                    <Lock className="h-4 w-4 ml-2 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Ce champ n'est pas modifiable
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="numeroEmploye_edit" className="text-right">
                  N° Employé
                </Label>
                <Input
                  id="numeroEmploye_edit"
                  name="numeroEmploye"
                  value={formData.numeroEmploye}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="adresse_edit" className="text-right">
                  Adresse
                </Label>
                <Input
                  id="adresse_edit"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              {/* Sélection de la compagnie d'assurance dans le formulaire d'édition */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="compagnie-edit" className="text-right">
                  Compagnie d'Assurance
                </Label>
                <div className="col-span-3">
                  <Select
                    value={formData.compagnieId || ""}
                    onValueChange={handleCompagnieChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une compagnie" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingCompagnie ? (
                        <SelectItem value="" disabled>Chargement...</SelectItem>
                      ) : compagnieData?.compagnies?.length > 0 ? (
                        compagnieData.compagnies.map((compagnie) => (
                          <SelectItem key={compagnie.compagnieId} value={compagnie.compagnieId}>
                            {compagnie.nomCompagnie || compagnie.nom}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>Aucune compagnie disponible</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="numeroAssurance_edit" className="text-right">
                  N° Assurance
                </Label>
                <Input
                  id="numeroAssurance_edit"
                  name="numeroAssurance"
                  value={formData.numeroAssurance}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cin_edit" className="text-right">
                  CIN
                </Label>
                <Input
                  id="cin_edit"
                  name="cin"
                  value={formData.cin}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="emailNotification-edit" className="text-right">
                  Email notification
                </Label>
                <Input
                  id="emailNotification-edit"
                  name="emailNotification"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.emailNotification}
                  onChange={handleChange}
                  className="col-span-3"
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