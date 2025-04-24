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
import { toast, Toaster } from "sonner";
import { PlusCircle, Pencil, Trash2, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CREATE_UTILISATEUR, DELETE_UTILISATEUR, GET_UTILISATEURS, UPDATE_UTILISATEUR } from "@/query/utilisateur";


export default function UtilisateursPage() {
    const router = useRouter();
    const { data, loading, error, refetch } = useQuery(GET_UTILISATEURS);
    const [createUtilisateur] = useMutation(CREATE_UTILISATEUR);
    const [updateUtilisateur] = useMutation(UPDATE_UTILISATEUR);
    const [deleteUtilisateur] = useMutation(DELETE_UTILISATEUR);
  
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [currentUtilisateur, setCurrentUtilisateur] = useState(null);
    const [formData, setFormData] = useState({
      nom: "",
      prenom: "",
      email: "",
      role: "employé",
      motDePasse: "",
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
        // Vérifier si l'utilisateur a les droits d'admin
        const decoded = jwtDecode(token);
        if (decoded.role !== "conseillerRH") {
          toast.error("Accès refusé", {
            description: "Vous n'avez pas les droits pour accéder à cette page."
          });
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        }
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
  
    const handleRoleChange = (value) => {
      setFormData(prev => ({ ...prev, role: value }));
    };
  
    const openCreateModal = () => {
      setFormData({
        nom: "",
        prenom: "",
        email: "",
        role: "employé",
        motDePasse: "",
      });
      setIsCreateModalOpen(true);
    };
  
    const openEditModal = (utilisateur) => {
      setCurrentUtilisateur(utilisateur);
      setFormData({
        nom: utilisateur.nom || "",
        prenom: utilisateur.prenom || "",
        email: utilisateur.email || "",
        role: utilisateur.role || "employé",
        motDePasse: "",
      });
      setIsEditModalOpen(true);
    };
  
    const openDetailsModal = (utilisateur) => {
      setCurrentUtilisateur(utilisateur);
      setIsDetailsModalOpen(true);
    };
  
    const openDeleteDialog = (utilisateur) => {
      setCurrentUtilisateur(utilisateur);
      setIsDeleteDialogOpen(true);
    };
  
    const handleCreateSubmit = async (e) => {
      e.preventDefault();
      
      try {
        const utilisateurInput = {
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          role: formData.role,
          motDePasse: formData.motDePasse,
        };
    
        const response = await createUtilisateur({
          variables: {
            utilisateurData: utilisateurInput
          }
        });
    
        console.log("Réponse de création:", response);
        setIsCreateModalOpen(false);
        refetch();
        toast.success("Utilisateur créé", {
          description: "L'utilisateur a été créé avec succès."
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
      
      try {
        const utilisateurInput = {
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          role: formData.role,
        };
        
        // Ajouter le mot de passe seulement s'il a été modifié
        if (formData.motDePasse) {
          utilisateurInput.motDePasse = formData.motDePasse;
        }
    
        const response = await updateUtilisateur({
          variables: {
            id: currentUtilisateur.utilisateurId,
            utilisateurData: utilisateurInput
          }
        });
    
        console.log("Réponse de mise à jour:", response);
        setIsEditModalOpen(false);
        refetch();
        toast.success("Utilisateur mis à jour", {
          description: "L'utilisateur a été mis à jour avec succès."
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
        await deleteUtilisateur({
          variables: {
            id: currentUtilisateur.utilisateurId
          }
        });
        setIsDeleteDialogOpen(false);
        refetch();
        toast.success("Utilisateur supprimé", {
          description: "L'utilisateur a été supprimé avec succès."
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
                  <BreadcrumbPage>Utilisateurs</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
            <Button onClick={openCreateModal}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Ajouter un utilisateur
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Chargement des utilisateurs...</p>
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
                    <TableHead>Nom</TableHead>
                    <TableHead>Prénom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.utilisateurs.length > 0 ? (
                    data.utilisateurs.map((user) => (
                      <TableRow key={user.utilisateurId}>
                        <TableCell>{user.nom}</TableCell>
                        <TableCell>{user.prenom}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.role === "ADMIN" ? "bg-purple-100 text-purple-800" : 
                            user.role === "MANAGER" ? "bg-blue-100 text-blue-800" : 
                            "bg-green-100 text-green-800"
                          }`}>
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openDetailsModal(user)}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditModal(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500"
                            onClick={() => openDeleteDialog(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        Aucun utilisateur trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </SidebarInset>

      {/* Modal de création d'utilisateur */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un utilisateur</DialogTitle>
            <DialogDescription>
              Remplissez le formulaire pour créer un nouvel utilisateur.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nom" className="text-right">
                  Nom
                </Label>
                <Input
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="prenom" className="text-right">
                  Prénom
                </Label>
                <Input
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Rôle
                </Label>
                <Select 
                  value={formData.role} 
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="USER">Utilisateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="motDePasse" className="text-right">
                  Mot de passe
                </Label>
                <Input
                  id="motDePasse"
                  name="motDePasse"
                  type="password"
                  value={formData.motDePasse}
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

      {/* Modal d'édition d'utilisateur */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'utilisateur.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nom-edit" className="text-right">
                  Nom
                </Label>
                <Input
                  id="nom-edit"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="prenom-edit" className="text-right">
                  Prénom
                </Label>
                <Input
                  id="prenom-edit"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email-edit" className="text-right">
                  Email
                </Label>
                <Input
                  id="email-edit"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role-edit" className="text-right">
                  Rôle
                </Label>
                <Select 
                  value={formData.role} 
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="USER">Utilisateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="motDePasse-edit" className="text-right">
                  Nouveau mot de passe
                </Label>
                <Input
                  id="motDePasse-edit"
                  name="motDePasse"
                  type="password"
                  value={formData.motDePasse}
                  onChange={handleChange}
                  className="col-span-3"
                  placeholder="Laisser vide pour ne pas changer"
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

      {/* Modal de détails d'utilisateur */}
      <Dialog 
        open={isDetailsModalOpen} 
        onOpenChange={setIsDetailsModalOpen}
        className="sm:max-w-xl"
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails de l'utilisateur</DialogTitle>
            <DialogDescription>
              Informations complètes sur l'utilisateur.
            </DialogDescription>
          </DialogHeader>
          
          {currentUtilisateur && (
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="informations">Informations</TabsTrigger>
              </TabsList>
              <TabsContent value="profile" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Profil de {currentUtilisateur.prenom} {currentUtilisateur.nom}</CardTitle>
                    <CardDescription>Informations de base de l'utilisateur</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">ID</p>
                        <p>{currentUtilisateur.utilisateurId}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Rôle</p>
                        <p className={`px-2 py-1 rounded-full text-xs inline-block ${
                          currentUtilisateur.role === "ADMIN" ? "bg-purple-100 text-purple-800" : 
                          currentUtilisateur.role === "MANAGER" ? "bg-blue-100 text-blue-800" : 
                          "bg-green-100 text-green-800"
                        }`}>
                          {currentUtilisateur.role}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Nom</p>
                        <p>{currentUtilisateur.nom}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Prénom</p>
                        <p>{currentUtilisateur.prenom}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p>{currentUtilisateur.email}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="informations" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations supplémentaires</CardTitle>
                    <CardDescription>Détails personnels et professionnels</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {currentUtilisateur.informations && currentUtilisateur.informations.length > 0 ? (
                      <div className="space-y-6">
                        {currentUtilisateur.informations.map((info) => (
                          <div key={info.informationId} className="border p-4 rounded-md">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-semibold">Information #{info.informationId}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                info.statut ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}>
                                {info.statut ? "Vérifié" : "Non vérifié"}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-500">N° Employé</p>
                                <p>{info.numeroEmploye}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">CIN</p>
                                <p>{info.cin}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-sm font-medium text-gray-500">Adresse</p>
                                <p>{info.adresse}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-500">N° Assurance</p>
                                <p>{info.numeroAssurance}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-500">Aucune information disponible</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter>
            <Button onClick={() => setIsDetailsModalOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cet utilisateur et toutes ses informations seront supprimés définitivement.
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