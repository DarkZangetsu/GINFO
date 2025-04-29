"use client"
import { useState } from "react"
import { useMutation, gql } from "@apollo/client"
import { toast, Toaster } from "sonner"
import { jwtDecode } from "jwt-decode"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const CREATE_UTILISATEUR_MUTATION = gql`
  mutation CreateUtilisateur(
    $username: String!, 
    $password: String!, 
    $nom: String, 
    $prenom: String, 
    $email: String, 
    $role: String
  ) {
    createUtilisateur(
      utilisateurData: {
        username: $username
        password: $password
        nom: $nom
        prenom: $prenom
        email: $email
        role: $role
      }
    ) {
      success
      message
      token
      refreshToken
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

export function RegisterForm({
  className,
  ...props
}) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    nom: "",
    prenom: "",
    email: "",
    role: "employé" 
  })
  const [isLoading, setIsLoading] = useState(false)

  const [createUtilisateur] = useMutation(CREATE_UTILISATEUR_MUTATION)

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleRoleChange = (value) => {
    setFormData(prev => ({
      ...prev,
      role: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Vérification que les mots de passe correspondent
    if (formData.password !== formData.confirmPassword) {
      toast.error("Erreur", {
        description: "Les mots de passe ne correspondent pas."
      })
      return
    }

    setIsLoading(true)

    try {
      const { data } = await createUtilisateur({
        variables: {
          username: formData.username,
          password: formData.password,
          nom: formData.nom || null,
          prenom: formData.prenom || null,
          email: formData.email || null,
          role: formData.role || null
        }
      })

      if (data?.createUtilisateur?.success) {
        // Stockage du token si disponible
        if (data.createUtilisateur.token) {
          localStorage.setItem("token", data.createUtilisateur.token)
          localStorage.setItem("refreshToken", data.createUtilisateur.refreshToken)
          
          try {
            // Décodage du token pour récupérer le rôle
            const decodedToken = jwtDecode(data.createUtilisateur.token);
            const userRole = decodedToken.role;
            
            toast.success("Inscription réussie", {
              description: "Votre compte a été créé avec succès."
            })
            
            // Redirection basée sur le rôle de l'utilisateur
            if (userRole === "employé") {
              window.location.href = "/employe";
            } else if (userRole === "conseillerRH") {
              window.location.href = "/dashboard";
            } else if (userRole === "assurance") {
              window.location.href = "/dashboard";
            } else {
              // Redirection par défaut
              window.location.href = "/dashboard";
            }
          } catch (decodeError) {
            console.error("Erreur lors du décodage du token:", decodeError);
            window.location.href = "/dashboard";
          }
        } else {
          // Si pas de token, redirection vers la page de connexion
          toast.success("Inscription réussie", {
            description: "Votre compte a été créé avec succès. Veuillez vous connecter."
          })
          window.location.href = "/login";
        }
      } else {
        toast.error("Erreur d'inscription", {
          description: data?.createUtilisateur?.message || "Une erreur s'est produite lors de l'inscription."
        })
      }
    } catch (error) {
      toast.error("Erreur d'inscription", {
        description: error.message || "Une erreur s'est produite lors de l'inscription."
      })
      console.error("Registration error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Toaster position="top-center" />
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Créer un compte</h1>
                <p className="text-muted-foreground text-balance">
                  Inscrivez-vous pour accéder à votre espace
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input
                    id="prenom"
                    type="text"
                    placeholder="Prénom"
                    value={formData.prenom}
                    onChange={handleChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input
                    id="nom"
                    type="text"
                    placeholder="Nom"
                    value={formData.nom}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="nom_utilisateur"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmez le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Rôle</Label>
                <Select
                  value={formData.role}
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employé">Employé</SelectItem>
                    <SelectItem value="conseillerRH">Conseiller RH</SelectItem>
                    <SelectItem value="assurance">Service d'assurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Inscription en cours..." : "S'inscrire"}
              </Button>

              <div className="text-center text-sm">
                Vous avez déjà un compte?{" "}
                <a href="/login" className="underline underline-offset-4">
                  Se connecter
                </a>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholder.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        En cliquant sur s'inscrire, vous acceptez nos <a href="#">Conditions d'utilisation</a>{" "}
        et notre <a href="#">Politique de confidentialité</a>.
      </div>
    </div>
  );
}