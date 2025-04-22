"use client"
import { useState } from "react"
import { useMutation, gql } from "@apollo/client"
import { toast, Toaster } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// GraphQL Login Mutation
const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      success
      message
      token
      refreshToken
    }
  }
`;

export function LoginForm({
  className,
  ...props
}) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [loginMutation] = useMutation(LOGIN_MUTATION)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data } = await loginMutation({
        variables: {
          username,
          password
        }
      })

      if (data.login.success) {
        localStorage.setItem("token", data.login.token)
        localStorage.setItem("refreshToken", data.login.refreshToken)
        
        toast.success("Connexion réussie", {
          description: "Vous êtes maintenant connecté."
        })

        window.location.href = "/dashboard"
      } else {
        toast.error("Erreur de connexion", {
          description: data.login.message || "Identifiants invalides"
        })
      }
    } catch (error) {
      toast.error("Erreur de connexion", {
        description: "Une erreur s'est produite lors de la connexion."
      })
      console.error("Login error:", error)
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
                <h1 className="text-2xl font-bold">Bienvenue</h1>
                <p className="text-muted-foreground text-balance">
                  Connectez-vous à votre compte
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="username">Nom d'utilisateur</Label>
                <Input 
                  id="username" 
                  type="text" 
                  placeholder="nom_utilisateur" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required 
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Mot de passe</Label>
                  <a href="#" className="ml-auto text-sm underline-offset-2 hover:underline">
                    Mot de passe oublié?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Connexion en cours..." : "Se connecter"}
              </Button>
              <div className="text-center text-sm">
                Vous n'avez pas de compte ?{" "}
                <a href="/register" className="underline underline-offset-4">
                  S'inscrire
                </a>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="/placeholder.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale" />
          </div>
        </CardContent>
      </Card>
      <div
        className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        En vous connectant, vous acceptez nos <a href="#">Conditions d'utilisation</a>{" "}
        et notre <a href="#">Politique de confidentialité</a>.
      </div>
    </div>
  );
}