"use client"
import * as React from "react"
import { useState } from "react"
import { useMutation, gql } from "@apollo/client"
import { toast } from "sonner"
import { InfoIcon, LayoutDashboard, Users, Bell, FileText, PieChart, LogOut } from "lucide-react"

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
          url: "#",
          icon: <Bell className="size-4 mr-2" />
        },
        {
          title: "Informations",
          url: "#",
          icon: <InfoIcon className="size-4 mr-2" />
        },
      ],
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutMutation] = useMutation(LOGOUT_MUTATION)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      // Récupérer le refreshToken depuis le localStorage
      const refreshToken = localStorage.getItem("refreshToken")
      
      // Vérifier si le refreshToken existe
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
        // Supprimer les tokens du localStorage
        localStorage.removeItem("token")
        localStorage.removeItem("refreshToken")
        
        toast.success("Déconnexion réussie", {
          description: "Vous avez été déconnecté avec succès."
        })
        
        // Rediriger vers la page de connexion
        window.location.href = "/login"
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
    }
  }

  return (
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
            <SidebarMenuButton 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <button className="flex items-center w-full">
                <LogOut className="size-4 mr-2" />
                {isLoggingOut ? "Déconnexion..." : "Se déconnecter"}
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}