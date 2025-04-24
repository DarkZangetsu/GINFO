"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client";
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
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Toaster } from "sonner";
import { Eye, History, CalendarClock, Mail, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GET_HISTORIQUES } from "@/query/historique";

export default function HistoriquePage() {
  const { data, loading, error } = useQuery(GET_HISTORIQUES);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentHistorique, setCurrentHistorique] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  const openDetailsModal = (historique) => {
    setCurrentHistorique(historique);
    setIsDetailsModalOpen(true);
  };

  const openNotificationModal = (notification) => {
    setSelectedNotification(notification);
    setIsNotificationModalOpen(true);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd MMMM yyyy à HH:mm", { locale: fr });
    } catch (error) {
      return dateString || "Date inconnue";
    }
  };

  
  const getActionBadgeVariant = (typeAction) => {
    switch (typeAction.toLowerCase()) {
      case "creation":
        return "default"; 
      case "modification":
        return "warning";
      case "suppression":
        return "destructive"; 
      case "envoi":
        return "success"; 
      default:
        return "outline";
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
                  <BreadcrumbPage>Historique</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold flex items-center">
              <History className="mr-2 h-5 w-5" />
              Historique des Actions
            </h1>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Chargement de l'historique...</p>
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
                    <TableHead>Date</TableHead>
                    <TableHead>Type d'Action</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Notifications</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.historiques.length > 0 ? (
                    data.historiques.map((historique) => (
                      <TableRow key={historique.historiqueId}>
                        <TableCell>
                          <div className="flex items-center">
                            <CalendarClock className="mr-2 h-4 w-4 text-muted-foreground" />
                            {formatDate(historique.date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getActionBadgeVariant(historique.typeAction)}>
                            {historique.typeAction}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{historique.description}</TableCell>
                        <TableCell>
                          {historique.notifications?.length > 0 ? (
                            <Badge variant="outline">
                              {historique.notifications.length} notification(s)
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">Aucune</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDetailsModal(historique)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        Aucun historique trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </SidebarInset>

      {/* Modal des détails de l'historique - AMÉLIORÉ */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <History className="mr-2 h-5 w-5" />
              Détails de l'action
            </DialogTitle>
            <DialogDescription>
              Informations complètes sur l'action enregistrée
            </DialogDescription>
          </DialogHeader>

          {currentHistorique && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Information</TabsTrigger>
                <TabsTrigger value="notifications">
                  Notifications
                  {currentHistorique.notifications?.length > 0 && (
                    <Badge variant="outline" className="ml-2">
                      {currentHistorique.notifications.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <Badge className="mr-2" variant={getActionBadgeVariant(currentHistorique.typeAction)}>
                        {currentHistorique.typeAction}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center">
                        <CalendarClock className="mr-1 h-4 w-4" />
                        {formatDate(currentHistorique.date)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Description</h3>
                        <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                          {currentHistorique.description}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Identifiant</h3>
                        <p className="text-sm">{currentHistorique.historiqueId}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications" className="mt-4">
                {currentHistorique.notifications && currentHistorique.notifications.length > 0 ? (
                  <div className="space-y-4">
                    {currentHistorique.notifications.map((notification, index) => (
                      <Card key={notification.notificationId} className="overflow-hidden">
                        <CardHeader className="pb-2 bg-muted/50">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base flex items-center">
                              <Mail className="mr-2 h-4 w-4" />
                              {notification.objet}
                            </CardTitle>
                            <Badge 
                              variant={notification.statut === "non_lu" ? "default" : "outline"}
                            >
                              {notification.statut === "non_envoyé" ? "Non envoyé" : "Envoyé"}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDate(notification.dateEnvoi)}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-center text-sm mb-3">
                            <div>
                              <span className="text-muted-foreground">De:</span> {notification.expediteur}
                            </div>
                            <div className="flex items-center">
                              <span className="text-muted-foreground mr-1">À:</span> 
                              <ArrowRight className="h-3 w-3 mx-1 text-muted-foreground" />
                              {notification.destinataire}
                            </div>
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => openNotificationModal(notification)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Voir le contenu complet
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                    <Mail className="h-10 w-10 mb-4 opacity-30" />
                    <p>Aucune notification associée</p>
                  </div>
                )}
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

      {/* Modal des détails de la notification */}
      <Dialog open={isNotificationModalOpen} onOpenChange={setIsNotificationModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              Détails de la notification
            </DialogTitle>
            <DialogDescription>
              Informations complètes sur la notification
            </DialogDescription>
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">{selectedNotification.objet}</h3>
                  <Badge 
                    variant={selectedNotification.statut === "non_lu" ? "default" : "outline"}
                  >
                    {selectedNotification.statut === "non_envoyé" ? "Non envoyé" : "Envoyé"}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center text-sm mb-4 text-muted-foreground">
                  <div>
                    De: <span className="font-medium text-foreground">{selectedNotification.expediteur}</span>
                  </div>
                  <div>
                    À: <span className="font-medium text-foreground">{selectedNotification.destinataire}</span>
                  </div>
                  <div>
                    <CalendarClock className="inline-block mr-1 h-3 w-3" />
                    {formatDate(selectedNotification.dateEnvoi)}
                  </div>
                </div>
                
                <div className="bg-muted p-4 rounded-md mb-4 whitespace-pre-wrap">
                  {selectedNotification.contenu}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Informations supplémentaires</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">ID de la notification</p>
                    <p className="font-medium">{selectedNotification.notificationId}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsNotificationModalOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Toaster richColors position="top-center" />
    </SidebarProvider>
  );
}