import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      toast({
        title: "Logged out successfully",
        description: "You have been signed out of your account."
      });
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Logout failed",
        description: error.message || "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-deep-black border-b border-emerald/20 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center min-w-0">
              <Link href="/">
                <span className="text-emerald text-xl font-bold cursor-pointer hover:text-gold transition-colors">
                  Metal Cards NYC
                </span>
              </Link>
            </div>
            <div className="hidden md:ml-8 md:flex md:space-x-6">
              <Link href="/templates">
                <span className={`${location === "/templates" ? "border-emerald text-emerald" : "border-transparent text-gray-300 hover:text-gold hover:border-gold"} border-b-2 px-1 pt-1 inline-flex items-center text-sm font-medium cursor-pointer transition-colors`}>
                  Templates
                </span>
              </Link>
              <Link href="/order">
                <span className={`${location === "/order" ? "border-emerald text-emerald" : "border-transparent text-gray-300 hover:text-gold hover:border-gold"} border-b-2 px-1 pt-1 inline-flex items-center text-sm font-medium cursor-pointer transition-colors`}>
                  Order Cards
                </span>
              </Link>

              <Link href="/ai-assistant">
                <span className={`${location === "/ai-assistant" ? "border-emerald text-emerald" : "border-transparent text-gray-300 hover:text-gold hover:border-gold"} border-b-2 px-1 pt-1 inline-flex items-center text-sm font-medium cursor-pointer transition-colors`}>
                  AI Assistant
                </span>
              </Link>
              <Link href="/svg-templates">
                <span className={`${location === "/svg-templates" ? "border-emerald text-emerald" : "border-transparent text-gray-300 hover:text-gold hover:border-gold"} border-b-2 px-1 pt-1 inline-flex items-center text-sm font-medium cursor-pointer transition-colors`}>
                  SVG Templates
                </span>
              </Link>
              {isAuthenticated && (
                <>
                  <Link href="/profile">
                    <span className={`${location === "/profile" ? "border-emerald text-emerald" : "border-transparent text-gray-300 hover:text-gold hover:border-gold"} border-b-2 px-1 pt-1 inline-flex items-center text-sm font-medium cursor-pointer transition-colors`}>
                      Profile
                    </span>
                  </Link>
                  <Link href="/dashboard">
                    <span className={`${location === "/dashboard" ? "border-emerald text-emerald" : "border-transparent text-gray-300 hover:text-gold hover:border-gold"} border-b-2 px-1 pt-1 inline-flex items-center text-sm font-medium cursor-pointer transition-colors`}>
                      Dashboard
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center flex-shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-300">
                  {user?.email}
                </div>
                <Button 
                  onClick={handleLogout}
                  variant="ghost"
                  className="text-gray-300 hover:text-gold px-3 py-2 text-sm font-medium transition-colors"
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "Signing Out..." : "Sign Out"}
                </Button>
              </div>
            ) : (
              <Link href="/login" className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md gold-button">
                Sign In
              </Link>
            )}
          </div>
          
          <div className="flex items-center md:hidden flex-shrink-0">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-card border-l border-border">
                <div className="flex flex-col space-y-6 mt-6">
                  <Link href="/templates" onClick={() => setIsMenuOpen(false)}>
                    <span className="text-muted-foreground hover:text-primary text-lg font-medium cursor-pointer">Templates</span>
                  </Link>
                  <Link href="/order" onClick={() => setIsMenuOpen(false)}>
                    <span className="text-muted-foreground hover:text-primary text-lg font-medium cursor-pointer">Order Cards</span>
                  </Link>

                  <Link href="/ai-assistant" onClick={() => setIsMenuOpen(false)}>
                    <span className="text-muted-foreground hover:text-primary text-lg font-medium cursor-pointer">AI Assistant</span>
                  </Link>
                  <Link href="/svg-templates" onClick={() => setIsMenuOpen(false)}>
                    <span className="text-muted-foreground hover:text-primary text-lg font-medium cursor-pointer">SVG Templates</span>
                  </Link>
                  {isAuthenticated && (
                    <>
                      <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                        <span className="text-muted-foreground hover:text-primary text-lg font-medium cursor-pointer">Profile</span>
                      </Link>
                      <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                        <span className="text-muted-foreground hover:text-primary text-lg font-medium cursor-pointer">Dashboard</span>
                      </Link>
                    </>
                  )}
                  
                  <div className="pt-6 border-t border-border">
                    {isAuthenticated ? (
                      <div className="space-y-4">
                        <div className="text-sm text-muted-foreground">{user?.email}</div>
                        <Button 
                          onClick={handleLogout}
                          variant="outline"
                          className="w-full"
                          disabled={logoutMutation.isPending}
                        >
                          {logoutMutation.isPending ? "Signing Out..." : "Sign Out"}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Link href="/login" className="block w-full text-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90">
                          Sign In
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
