"use client"
import { useEffect, useState } from "react"
import { useQuery } from "@apollo/client"
import { jwtDecode } from "jwt-decode"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BellRing, Clock, CalendarDays, User, FileText, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react"
import { GET_UTILISATEUR } from "@/query/utilisateur"


export default function EmployeePage() {
  const [userId, setUserId] = useState(null)
  const [date, setDate] = useState(new Date())
  
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decodedToken = jwtDecode(token);
        setUserId(decodedToken.utilisateurId);

        if (decodedToken.role !== "employé") {
          window.location.href = "/login";
        }
      } else {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Erreur lors du décodage du token:", error);
      window.location.href = "/login";
    }
  }, []);

  const { loading, error, data } = useQuery(GET_UTILISATEUR, {
    variables: { id: userId },
    skip: !userId,
  });

  if (loading || !userId) {
    return <EmployeePageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="w-full max-w-6xl px-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>
              Une erreur s'est produite lors du chargement de vos données. Veuillez réessayer.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const utilisateur = data?.utilisateurById;
  
  if (!utilisateur) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="w-full max-w-6xl px-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Utilisateur non trouvé</AlertTitle>
            <AlertDescription>
              Impossible de charger vos informations. Veuillez vous reconnecter.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const initials = `${utilisateur.prenom.charAt(0)}${utilisateur.nom.charAt(0)}`.toUpperCase();
  const isProfileUpToDate = utilisateur.informations?.statut === "true";

  // Notifications avec condition de statut
  const notifications = [
    ...(isProfileUpToDate ? [] : [{
      id: 0, 
      title: "Mise à jour de profil requise", 
      description: "Veuillez mettre à jour votre profil. Contactez votre conseiller RH.",
      date: "Aujourd'hui",
      important: true
    }]),
    // { id: 1, title: "Notification RH", description: "Veuillez mettre à jour vos informations personnelles", date: "Aujourd'hui" },
    // { id: 2, title: "Demande de congé", description: "Votre demande a été approuvée", date: "Hier" },
  ];

  const upcomingEvents = [
    { id: 1, title: "Réunion d'équipe", date: "Demain, 10:00", location: "Salle de conférence A" },
    { id: 2, title: "Formation sécurité", date: "24 mai, 14:00", location: "Salle de formation" },
  ];

  return (
    <div className="flex justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-6xl px-4 py-8">
        <div className="flex flex-col md:flex-row items-start gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg" alt="Photo de profil" />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">Bonjour, {utilisateur.prenom}</h1>
              <p className="text-muted-foreground">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
          <div className="ml-auto">
            <Button asChild>
              <a href="/profile-employe">
                <User className="mr-2 h-4 w-4" />
                Voir mon profil
              </a>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid w-full md:w-auto grid-cols-3 md:inline-flex">
            <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
            <TabsTrigger value="calendar">Calendrier</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BellRing className="mr-2 h-4 w-4" />
                    Notifications
                  </CardTitle>
                  <CardDescription>Vos dernières notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  {notifications.length > 0 ? (
                    <div className="space-y-4">
                      {notifications.map(notification => (
                        <div key={notification.id} className="border-b pb-3 last:border-0 last:pb-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{notification.title}</h4>
                              {notification.important && (
                                <Badge variant="destructive" className="flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  Important
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">{notification.date}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-6">Aucune notification</p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Événements à venir
                  </CardTitle>
                  <CardDescription>Vos prochains rendez-vous</CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingEvents.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingEvents.map(event => (
                        <div key={event.id} className="border-b pb-3 last:border-0 last:pb-0">
                          <h4 className="font-medium">{event.title}</h4>
                          <div className="flex items-center mt-1 text-sm text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            {event.date}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">{event.location}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-6">Aucun événement à venir</p>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>Vos données d'employé</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Numéro d'employé</h4>
                    <p>{utilisateur.informations?.numeroEmploye || "Non renseigné"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Statut</h4>
                    {isProfileUpToDate ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle2 className="mr-1 h-4 w-4" />
                        <span>Vos informations sont à jour</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-amber-600">
                        <AlertTriangle className="mr-1 h-4 w-4" />
                        <span>Mise à jour requise</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Email</h4>
                    <p>{utilisateur.email}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Adresse</h4>
                    <p>{utilisateur.informations?.adresse || "Non renseignée"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">CIN</h4>
                    <p>{utilisateur.informations?.cin || "Non renseigné"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Numéro d'assurance</h4>
                    <p>{utilisateur.informations?.numeroAssurance || "Non renseigné"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Calendrier</CardTitle>
                <CardDescription>Consultez votre planning</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Mes Documents
                </CardTitle>
                <CardDescription>Vos documents importants</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-6">
                  Aucun document disponible pour le moment
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Loading skeleton for employee page
function EmployeePageSkeleton() {
  return (
    <div className="flex justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-6xl px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48 mt-1" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48 mt-1" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-3/5" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}