
import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArticleForm } from '@/components/ArticleForm';
import { Plus, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CategoryManagement } from './CategoryManagement';
import { ArticlesTable } from '@/components/ArticlesTable';
import { ArticlesEmptyState } from '@/components/ArticlesEmptyState';
import { SearchInput } from '@/components/SearchInput';
import { ArticleFilters } from '@/components/ArticleFilters';
import { useArticleDeletion } from '@/hooks/useArticleDeletion';

export function ArticlesList() {
  const [showForm, setShowForm] = useState(false);
  const [editArticle, setEditArticle] = useState(null);
  const [openCategoryCrud, setOpenCategoryCrud] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const deleteMutation = useArticleDeletion();

  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          categories(name),
          donors(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  const filteredArticles = useMemo(() => {
    if (!articles) return [];

    return articles.filter((article) => {
      // Recherche textuelle
      const matchesSearch = searchTerm === '' || 
        article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.categories?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.donors?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtres
      const matchesStatus = statusFilter === '' || article.status === statusFilter;
      const matchesState = stateFilter === '' || article.state === stateFilter;
      const matchesCategory = categoryFilter === '' || article.category_id === categoryFilter;

      return matchesSearch && matchesStatus && matchesState && matchesCategory;
    });
  }, [articles, searchTerm, statusFilter, stateFilter, categoryFilter]);

  const handleEdit = (article: any) => {
    setEditArticle(article);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleAddArticle = () => {
    setEditArticle(null);
    setShowForm(true);
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setStateFilter('');
    setCategoryFilter('');
    setSearchTerm('');
  };

  if (isLoading) {
    return <div className="text-center py-8">Chargement des articles...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Erreur lors du chargement des articles</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Articles</h2>
          <p className="text-gray-600">
            {filteredArticles?.length || 0} article{filteredArticles?.length > 1 ? 's' : ''} 
            {articles && filteredArticles?.length !== articles?.length && (
              <span> sur {articles?.length} total</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showForm} onOpenChange={(open) => {
            if (!open) {
              setShowForm(false);
              setEditArticle(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" onClick={handleAddArticle}>
                <Plus className="h-4 w-4" />
                Ajouter un Article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogTitle>
                {editArticle ? 'Modifier Article' : 'Nouvel Article'}
              </DialogTitle>
              <DialogDescription>
                {editArticle ? 'Modifiez les informations de l\'article.' : 'Ajoutez un nouvel article à votre inventaire.'}
              </DialogDescription>
              <ArticleForm 
                onClose={() => { setShowForm(false); setEditArticle(null); }} 
                articleId={editArticle?.id}
                defaultValues={editArticle || undefined}
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={openCategoryCrud} onOpenChange={setOpenCategoryCrud}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Catégories
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogTitle>Gestion des catégories</DialogTitle>
              <DialogDescription>
                Gérez vos catégories d'articles : ajoutez, modifiez ou supprimez des catégories.
              </DialogDescription>
              <CategoryManagement onClose={() => setOpenCategoryCrud(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Rechercher par nom, identifiant, catégorie ou donateur..."
          className="max-w-md"
        />

        <ArticleFilters
          statusFilter={statusFilter}
          stateFilter={stateFilter}
          categoryFilter={categoryFilter}
          onStatusChange={setStatusFilter}
          onStateChange={setStateFilter}
          onCategoryChange={setCategoryFilter}
          onClearFilters={handleClearFilters}
          categories={categories || []}
        />
      </div>

      {!filteredArticles || filteredArticles.length === 0 ? (
        searchTerm || statusFilter || stateFilter || categoryFilter ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 mb-4">Aucun article ne correspond à vos critères de recherche</p>
            <Button variant="outline" onClick={handleClearFilters}>
              Effacer les filtres
            </Button>
          </div>
        ) : (
          <ArticlesEmptyState onAddArticle={handleAddArticle} />
        )
      ) : (
        <ArticlesTable
          articles={filteredArticles}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
