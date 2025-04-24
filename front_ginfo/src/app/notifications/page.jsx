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
import {  Toaster } from "sonner";
import { Eye, Bell } from "lucide-react";
import { GET_NOTIFICATIONS } from "@/query/notification";



export default function NotificationsPage() {
  const { data, loading, error } = useQuery(GET_NOTIFICATIONS);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);

  const openDetailsModal = (notification) => {
    setCurrentNotification(notification);
    setIsDetailsModalOpen(true);
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd MMMM yyyy à HH:mm", { locale: fr });
    } catch (error) {
      return dateString || "Date inconnue";
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
                  <BreadcrumbPage>Notifications</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Centre de Notifications
            </h1>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Chargement des notifications...</p>
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
                    <TableHead>Objet</TableHead>
                    <TableHead>Expéditeur</TableHead>
                    <TableHead>Destinataire</TableHead>
                    <TableHead>Date d'envoi</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.notifications.length > 0 ? (
                    data.notifications.map((notification) => (
                      <TableRow 
                        key={notification.notificationId}
                        className={notification.statut === "non_envoyé" ? "bg-blue-50" : ""}
                      >
                        <TableCell className="font-medium">{notification.objet}</TableCell>
                        <TableCell>{notification.expediteur}</TableCell>
                        <TableCell>{notification.destinataire}</TableCell>
                        <TableCell>{formatDate(notification.dateEnvoi)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={notification.statut === "non_lu" ? "default" : "outline"}
                          >
                            {notification.statut === "non_envoyé" ? "Non envoyé" : "Envoyé"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDetailsModal(notification)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24">
                        Aucune notification trouvée
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </SidebarInset>

      {/* Modal des détails de la notification */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Détails de la notification</DialogTitle>
            <DialogDescription>
              Informations complètes sur la notification
            </DialogDescription>
          </DialogHeader>

          {currentNotification && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">{currentNotification.objet}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {formatDate(currentNotification.dateEnvoi)}
                </p>
                <div className="bg-muted p-4 rounded-md mb-4 whitespace-pre-wrap">
                  {currentNotification.contenu}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Informations supplémentaires</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Expéditeur</p>
                    <p className="font-medium">{currentNotification.expediteur}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Destinataire</p>
                    <p className="font-medium">{currentNotification.destinataire}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Statut</p>
                    <p className="font-medium">{currentNotification.statut === "non_lu" ? "Non lu" : "Lu"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">ID de la notification</p>
                    <p className="font-medium">{currentNotification.notificationId}</p>
                  </div>
                </div>
              </div>

              {currentNotification.information && (
                <div>
                  <h4 className="font-medium mb-2">Informations de l'employé</h4>
                  <div className="bg-muted p-4 rounded-md">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Numéro d'employé</p>
                        <p className="font-medium">{currentNotification.information.numeroEmploye}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">CIN</p>
                        <p className="font-medium">{currentNotification.information.cin}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Numéro d'assurance</p>
                        <p className="font-medium">{currentNotification.information.numeroAssurance}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Adresse</p>
                        <p className="font-medium">{currentNotification.information.adresse}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsDetailsModalOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Toaster richColors position="top-center" />
    </SidebarProvider>
  );
}