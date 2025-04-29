"use client"
import { useEffect, useState } from "react"
import { useQuery } from "@apollo/client"
import { jwtDecode } from "jwt-decode"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Shield, Mail, Briefcase, Home, CreditCard, FileText, CheckCircle2, ArrowLeft } from "lucide-react"
import { GET_UTILISATEUR } from "@/query/utilisateur"


export default function ProfilePage() {
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decodedToken = jwtDecode(token);
        setUserId(decodedToken.utilisateurId);
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

  if (!userId) {
    return <ProfileSkeleton />;
  }

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="flex justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-4xl px-4 py-8">
          <Card className="w-full">
            <CardContent className="p-6">
              <div className="text-center p-8">
                <h2 className="text-xl font-bold text-red-500">Erreur lors du chargement du profil</h2>
                <p className="text-muted-foreground mt-2">Veuillez réessayer plus tard.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const utilisateur = data?.utilisateurById || {};
  
  // Extraire les informations du tableau pour un accès plus facile
  const userInfo = utilisateur.informations && utilisateur.informations.length > 0 
    ? utilisateur.informations[0] 
    : {};

  console.log('Utilisateur data:', utilisateur);
  console.log('User Info:', userInfo);

  if (!utilisateur || !utilisateur.nom) {
    return (
      <div className="flex justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-4xl px-4 py-8">
          <Card className="w-full">
            <CardContent className="p-6">
              <div className="text-center p-8">
                <h2 className="text-xl font-bold">Utilisateur non trouvé</h2>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const initials = `${utilisateur.prenom?.charAt(0) || ''}${utilisateur.nom?.charAt(0) || ''}`.toUpperCase();

  return (
    <div className="flex justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-4xl px-4 py-8">
        <Button variant="outline" size="sm" className="mb-4" asChild>
          <a href="/employe">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à mon espace
          </a>
        </Button>
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold">Mon Profil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder.svg" alt="Photo de profil" />
                  <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="mt-4 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="font-medium">{utilisateur.role}</span>
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">
                    {utilisateur.prenom} {utilisateur.nom}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{utilisateur.email}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Numéro d'employé</div>
                    <div className="font-medium flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" />
                      {userInfo?.numeroEmploye || "Non renseigné"}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Statut</div>
                    {userInfo?.statut === true ? (
                      <div className="font-medium flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                        À jour
                      </div>
                    ) : (
                      <div className="font-medium">
                        Mise à jour requise
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Numéro d'assurance</div>
                    <div className="font-medium flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                      {userInfo?.numeroAssurance || "Non renseigné"}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">CIN</div>
                    <div className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      {userInfo?.cin || "Non renseigné"}
                    </div>
                  </div>
                  
                  <div className="space-y-1 col-span-2">
                    <div className="text-sm text-muted-foreground">Adresse</div>
                    <div className="font-medium flex items-center gap-2">
                      <Home className="h-4 w-4 text-primary" />
                      {userInfo?.adresse || "Non renseignée"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Loading skeleton for profile page
function ProfileSkeleton() {
  return (
    <div className="flex justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-4xl px-4 py-8">
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex flex-col items-center">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-4 w-20 mt-4" />
              </div>
              
              <div className="flex-1 space-y-4 w-full">
                <div>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32 mt-2" />
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={i === 4 ? "col-span-2" : ""}>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}