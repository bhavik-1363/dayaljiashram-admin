"use client";

import { Search, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/firebase/auth-context";
import Image from "next/image";
import { useActions } from "./action-provider";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export function AdminHeader() {
  const { user, logout } = useAuth();
  const { confirmAction } = useActions();
  const { toast } = useToast();
  const router = useRouter()
  
  const handleLogout = () => {
    confirmAction({
      title: "Logout",
      description: `Are you sure you want to log out?`,
      confirmText: "Logout",
      action: async () => {
        await logout()
      toast({
        title: "Logout successful",
        description: "You have been logged out successfully.",
      })
      router.push("/login")
      },
    })
  }
  return (
      <header className="flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <SidebarTrigger>
          <Menu className="h-5 w-5" />
        </SidebarTrigger>
        <div className="w-full flex-1">
          <div className="relative h-10">
            <Image
              src="/logo_name.png"
              alt="Dayalji Ashram Logo"
              fill
              className="object-contain"
            />
          </div>
          {/* <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Global Search..."
              className="w-full appearance-none bg-background pl-8 md:w-2/3 lg:w-1/3"
            />
          </div>
        </form> */}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatar.png" alt="Avatar" />
                <AvatarFallback>
                  {user?.email?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.displayName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={handleLogout}
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
    )
}
