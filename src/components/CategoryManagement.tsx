import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CategoryManagementProps {
  onClose: () => void;
}

export function CategoryManagement({ onClose }: CategoryManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editId, setEditId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [editValue, setEditValue] = useState("");

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("name");
      return data || [];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from("categories").insert([{ name }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Catégorie ajoutée !" });
      setNewName("");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: any) => {
      console.error("Erreur AJOUT catégorie", error);
      toast({
        variant: "destructive",
        title: "Erreur à l’ajout",
        description: error?.message || "Impossible d’ajouter la catégorie.",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase.from("categories").update({ name }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Catégorie renommée !" });
      setEditId(null);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: any) => {
      console.error("Erreur MODIF catégorie", error);
      toast({
        variant: "destructive",
        title: "Erreur lors du renommage",
        description: error?.message || "Impossible de modifier la catégorie.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Catégorie supprimée" });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: any) => {
      console.error("Erreur SUPPRESSION catégorie", error);
      toast({
        variant: "destructive",
        title: "Erreur à la suppression",
        description: error?.message || "Impossible de supprimer la catégorie.",
      });
    },
  });

  return (
    <div className="space-y-4">
      <form onSubmit={e => { e.preventDefault(); addMutation.mutate(newName); }}>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Nouvelle catégorie"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            disabled={addMutation.isPending}
          />
          <Button type="submit" disabled={!newName.trim() || addMutation.isPending}>
            <Plus className="h-4 w-4 mr-1" />
            Ajouter
          </Button>
        </div>
      </form>
      
      {isLoading ? (
        <div>Chargement…</div>
      ) : (
        <ul className="space-y-2">
          {categories?.map((cat: any) => (
            <li key={cat.id} className="flex items-center gap-2">
              {editId === cat.id ? (
                <>
                  <Input
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    className="w-auto"
                  />
                  <Button
                    size="sm"
                    onClick={() => updateMutation.mutate({ id: cat.id, name: editValue })}
                    disabled={updateMutation.isPending}
                  >
                    Enregistrer
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>
                    Annuler
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1">{cat.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditId(cat.id);
                      setEditValue(cat.name);
                    }}
                    title="Renommer"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (window.confirm("Supprimer cette catégorie ?")) {
                        deleteMutation.mutate(cat.id);
                      }
                    }}
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
