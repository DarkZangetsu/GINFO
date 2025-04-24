"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { jwtDecode } from "jwt-decode";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Toaster, toast } from "sonner";
import { User, Mail, MapPin, Edit, Save, FileText, Shield } from "lucide-react";
import { useForm } from "react-hook-form";

const GET_UTILISATEUR = gql`
  query UtilisateurById($id: ID!) {
    utilisateurById(id: $id) {
      utilisateurId
      nom
      prenom
      email
      role
      informations {
        numeroEmploye
        adresse
        numeroAssurance
        cin
        statut
      }
    }
  }
`;

const UPDATE_UTILISATEUR = gql`
  mutation UpdateUtilisateur($id: ID!, $utilisateurData: UtilisateurInput!) {
    updateUtilisateur(id: $id, utilisateurData: $utilisateurData) {
      utilisateur {
        utilisateurId
        nom
        prenom
        email
        role
      }
    }
  }
`;

export default function ProfilePage() {
  const [userId, setUserId] = useState(null);

  const form = useForm({
    defaultValues: {
      nom: "",
      prenom: "",
      email: "",
      adresse: "",
      numeroEmploye: "",
      numeroAssurance: "",
      cin: "",
    },
  });

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decodedToken = jwtDecode(token);
        setUserId(decodedToken.utilisateurId);
      }
    } catch (error) {
      console.error("Erreur lors du décodage du token:", error);
    }
  }, []);

  const { data, loading, error, refetch } = useQuery(GET_UTILISATEUR, {
    variables: { id: userId },
    skip: !userId,
    fetchPolicy: "network-only",
    onCompleted: (data) => {
      if (data?.utilisateurById) {
        const user = data.utilisateurById;
        form.reset({
          nom: user.nom || "",
          prenom: user.prenom || "",
          email: user.email || "",
          adresse: user.informations?.adresse || "",
          numeroEmploye: user.informations?.numeroEmploye || "",
          numeroAssurance: user.informations?.numeroAssurance || "",
          cin: user.informations?.cin || "",
        });
      }
    }
  });

  const [updateUtilisateur] = useMutation(UPDATE_UTILISATEUR);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (data && data.utilisateurById) {
      console.log("Données brutes reçues:", JSON.stringify(data.utilisateurById, null, 2));
    }
  }, [data]);


  useEffect(() => {
    if (data?.utilisateurById) {
      const user = data.utilisateurById;
      const userInfo = user.informations && user.informations.length > 0 ? user.informations[0] : {};

      console.log("Informations utilisateur extraites:", userInfo);

      setTimeout(() => {
        form.setValue("nom", user.nom || "");
        form.setValue("prenom", user.prenom || "");
        form.setValue("email", user.email || "");
        form.setValue("adresse", userInfo.adresse || "");
        form.setValue("numeroEmploye", userInfo.numeroEmploye || "");
        form.setValue("numeroAssurance", userInfo.numeroAssurance || "");
        form.setValue("cin", userInfo.cin || "");
      }, 0);
    }
  }, [data, form]);

  const handleEditToggle = () => {
    if (isEditMode) {
      if (data?.utilisateurById) {
        const user = data.utilisateurById;
        const userInfo = user.informations && user.informations.length > 0 ? user.informations[0] : {};

        form.reset({
          nom: user.nom || "",
          prenom: user.prenom || "",
          email: user.email || "",
          adresse: userInfo.adresse || "",
          numeroEmploye: userInfo.numeroEmploye || "",
          numeroAssurance: userInfo.numeroAssurance || "",
          cin: userInfo.cin || "",
        });
      }
    }
    setIsEditMode(!isEditMode);
  };

  const onSubmit = async (formData) => {
    try {
      const hasExistingInfo = data?.utilisateurById?.informations && data.utilisateurById.informations.length > 0;

      await updateUtilisateur({
        variables: {
          id: userId,
          utilisateurData: {
            nom: formData.nom,
            prenom: formData.prenom,
            email: formData.email,
            informations: [{
              adresse: formData.adresse,
              numeroEmploye: formData.numeroEmploye,
              numeroAssurance: formData.numeroAssurance,
              cin: formData.cin,
              statut: hasExistingInfo ? data.utilisateurById.informations[0].statut : null
            }]
          }
        }
      });
      toast.success("Profil mis à jour avec succès");
      refetch();
      setIsEditMode(false);
    } catch (err) {
      toast.error("Erreur lors de la mise à jour du profil");
      console.error(err);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case "employé":
        return "default";
      case "conseillerrh":
        return "warning";
      case "assurance":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatutBadgeColor = (statut) => {
    if (typeof statut === 'boolean') {
      return statut ? "success" : "destructive";
    }

    if (typeof statut === 'string') {
      switch (statut.toLowerCase()) {
        case "actif":
          return "success";
        case "inactif":
          return "destructive";
        case "en_attente":
          return "warning";
        default:
          return "outline";
      }
    }

    // Si statut est undefined ou null
    return "outline";
  };

  if (!userId) return (
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
                  <BreadcrumbPage>Mon Profil</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex justify-center items-center h-full">
          <p>Authentification requise...</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );

  if (loading) return (
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
                  <BreadcrumbPage>Mon Profil</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex justify-center items-center h-full">
          <p>Chargement du profil...</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );

  if (error) return (
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
                  <BreadcrumbPage>Mon Profil</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex justify-center items-center h-full">
          <p className="text-red-500">Erreur: {error.message}</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );

  // S'assurer que l'utilisateur est disponible
  const user = data?.utilisateurById;

  // Debug - afficher dans la console si les données sont bien présentes
  console.log("Données utilisateur:", user);

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
                  <BreadcrumbPage>Mon Profil</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold flex items-center">
              <User className="mr-2 h-5 w-5" />
              Profil Utilisateur
              {user && user.prenom && user.nom && (
                <span className="ml-2 text-gray-500">
                  - {user.prenom} {user.nom}
                </span>
              )}
            </h1>
            <div className="flex gap-2">
              <Button
                variant={isEditMode ? "outline" : "default"}
                onClick={handleEditToggle}
              >
                {isEditMode ? (
                  <>Annuler</>
                ) : (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </>
                )}
              </Button>
              {isEditMode && (
                <Button onClick={form.handleSubmit(onSubmit)}>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
                </Button>
              )}
            </div>
          </div>

          <Tabs defaultValue="informations" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="informations">Informations personnelles</TabsTrigger>
              <TabsTrigger value="securite">Sécurité & Compte</TabsTrigger>
            </TabsList>

            <TabsContent value="informations" className="mt-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <User className="mr-2 h-5 w-5" />
                          Informations Personnelles
                        </CardTitle>
                        <CardDescription>
                          Vos informations d'identité
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="nom"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nom</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Nom"
                                    disabled={!isEditMode}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="prenom"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Prénom</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Prénom"
                                    disabled={!isEditMode}
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="flex">
                                  <Mail className="w-4 h-4 mr-2 mt-2 text-muted-foreground" />
                                  <Input
                                    placeholder="Email"
                                    type="email"
                                    disabled={!isEditMode}
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">Rôle</div>
                            <div className="mt-1">
                              <Badge variant={getRoleBadgeColor(user?.role)}>
                                {user?.role || "Non défini"}
                              </Badge>
                            </div>
                          </div>

                          {user?.informations && user.informations.length > 0 && user.informations[0].statut !== undefined && (
                            <div>
                              <div className="text-sm font-medium">Statut</div>
                              <div className="mt-1">
                                <Badge variant={getStatutBadgeColor(user.informations[0].statut)}>
                                  {typeof user.informations[0].statut === 'boolean'
                                    ? (user.informations[0].statut ? "Actif" : "Inactif")
                                    : user.informations[0].statut || "Non défini"}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <FileText className="mr-2 h-5 w-5" />
                          Informations Complémentaires
                        </CardTitle>
                        <CardDescription>
                          Détails supplémentaires de votre profil
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="numeroEmploye"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Numéro d'employé</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Numéro d'employé"
                                  disabled={!isEditMode}
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="cin"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CIN</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Carte d'identité nationale"
                                  disabled={!isEditMode}
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="numeroAssurance"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Numéro d'assurance</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Numéro d'assurance"
                                  disabled={!isEditMode}
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="adresse"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Adresse</FormLabel>
                              <FormControl>
                                <div className="flex">
                                  <MapPin className="w-4 h-4 mr-2 mt-2 text-muted-foreground" />
                                  <Input
                                    placeholder="Adresse"
                                    disabled={!isEditMode}
                                    {...field}
                                    value={field.value || ""}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="securite" className="mt-4">
              <div className="grid gap-6 md:grid-cols-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="mr-2 h-5 w-5" />
                      Sécurité du compte
                    </CardTitle>
                    <CardDescription>
                      Informations de connexion et sécurité
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Identifiant utilisateur</Label>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <code className="text-sm">{userId}</code>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Email de connexion</Label>
                      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{user?.email}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>

      <Toaster richColors position="top-center" />
    </SidebarProvider>
  );
}