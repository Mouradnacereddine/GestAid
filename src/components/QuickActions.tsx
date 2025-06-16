
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, Users, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export function QuickActions() {
  const actions = [
    {
      title: "Nouvel Article",
      description: "Ajouter un article au stock",
      icon: Package,
      color: "bg-humanitarian-blue hover:bg-blue-700",
      href: "/articles"
    },
    {
      title: "Nouveau Bénéficiaire",
      description: "Enregistrer une nouvelle personne",
      icon: Users,
      color: "bg-humanitarian-green hover:bg-green-700",
      href: "/beneficiaires"
    },
    {
      title: "Nouveau Prêt",
      description: "Effectuer un prêt d'article",
      icon: FileText,
      color: "bg-humanitarian-orange hover:bg-orange-700",
      href: "/prets"
    }
  ];

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900">
          <Plus className="h-5 w-5" />
          Actions Rapides
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="w-full h-auto p-4 justify-start border-2 hover:border-gray-300 transition-all duration-200"
            asChild
          >
            <Link to={action.href}>
              <div className="flex items-center gap-4 w-full">
                <div className={`p-2 rounded-lg ${action.color} text-white`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900">{action.title}</p>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </div>
              </div>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
