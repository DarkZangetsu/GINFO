"use client"
import * as React from "react"
import { useState, useEffect } from "react"
import { useMutation, gql } from "@apollo/client"
import { toast } from "sonner"
import { InfoIcon, LayoutDashboard, Users, Bell, FileText, PieChart, LogOut, HistoryIcon, SaveOffIcon, Shield } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarFooter
} from "@/components/ui/sidebar"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"

const LOGOUT_MUTATION = gql`
 mutation Logout($refreshToken: String!) {
  logout(refreshToken: $refreshToken) {
    success
    message
  }
}
`;

const data = {
  navMain: [
    {
      title: "Aperçu",
      url: "#",
      icon: <PieChart className="size-4 mr-2" />,
      items: [
        {
          title: "Tableau de bord",
          url: "#",
          isActive: true,
          icon: <LayoutDashboard className="size-4 mr-2" />
        },
      ],
    },
    {
      title: "Gestion",
      url: "#",
      icon: <FileText className="size-4 mr-2" />,
      items: [
        {
          title: "Utilisateurs",
          url: "#",
          icon: <Users className="size-4 mr-2" />
        },
        {
          title: "Notifications",
          url: "",
          icon: <Bell className="size-4 mr-2" />
        },
        {
          title: "Informations",
          url: "/informations",
          icon: <InfoIcon className="size-4 mr-2" />
        },
        {
          title: "Historiques",
          url: "",
          icon: <HistoryIcon className="size-4 mr-2" />
        },
        {
          title: "Compagnie Assurance",
          url: "/compagnies",
          icon: <Shield className="size-4 mr-2" />
        },
      ],
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [refreshToken, setRefreshToken] = useState("")
  const [logoutMutation] = useMutation(LOGOUT_MUTATION)
  
  useEffect(() => {
    const storedToken = localStorage.getItem("refreshToken") || ""
    setRefreshToken(storedToken)
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      if (!refreshToken) {
        toast.error("Erreur de déconnexion", {
          description: "Aucun token de rafraîchissement trouvé."
        })
        setIsLoggingOut(false)
        return
      }
      
      const { data } = await logoutMutation({
        variables: {
          refreshToken: refreshToken
        }
      })
      
      if (data.logout.success) {
        localStorage.removeItem("token")
        localStorage.removeItem("refreshToken")
        
        toast.success("Déconnexion réussie", {
          description: "Vous avez été déconnecté avec succès.",
          position: "top-center",
          duration: 3000,
          className: "animate-in fade-in slide-in-from-top",
        })
        
        setTimeout(() => {
          if (typeof document !== "undefined") {
            document.body.classList.add('fade-out')
          }
          setTimeout(() => {
            window.location.href = "/login"
          }, 500)
        }, 1000)
      } else {
        toast.error("Erreur de déconnexion", {
          description: data.logout.message || "Une erreur est survenue lors de la déconnexion."
        })
      }
    } catch (error) {
      toast.error("Erreur de déconnexion", {
        description: "Une erreur s'est produite lors de la déconnexion."
      })
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
      setShowLogoutDialog(false)
    }
  }

  return (
    <>
      {typeof window !== "undefined" && (
        <style jsx global>{`
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          .fade-out {
            animation: fadeOut 0.5s ease-out forwards;
          }
        `}</style>
      )}
      
      <Sidebar {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="#">
                  <div
                    className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <InfoIcon className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-medium">GINFO</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="font-medium flex items-center">
                      {item.icon}
                      {item.title}
                    </a>
                  </SidebarMenuButton>
                  {item.items?.length ? (
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={subItem.isActive}>
                            <a href={subItem.url} className="flex items-center">
                              {subItem.icon}
                              {subItem.title}
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  ) : null}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t pt-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <div 
                onClick={() => setShowLogoutDialog(true)}
                className="flex w-full cursor-pointer px-3 py-2 text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="size-4 mr-2" />
                <span>Se déconnecter</span>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md animate-in fade-in-0 zoom-in-95">
          <DialogHeader>
            <DialogTitle>Confirmation de déconnexion</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir vous déconnecter de l'application ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleLogout} 
              disabled={isLoggingOut}
              className="transition-all duration-200 ease-in-out"
            >
              {isLoggingOut ? "Déconnexion en cours..." : "Se déconnecter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}