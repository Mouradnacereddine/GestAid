import React, { useState, useMemo } from 'react';
import { PlusCircle } from 'lucide-react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ArticlesTable, Article } from '@/components/ArticlesTable';
import { ArticleForm } from '@/components/ArticleForm';
import { ArticleFilters } from '@/components/ArticleFilters';
import { useArticles } from '@/hooks/useArticles';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Articles() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: '', state: '', category: '' });

  const queryClient = useQueryClient();
  const { data: articles = [], isLoading } = useArticles();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('id, name');
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (articleId: string) => {
      const { error } = await supabase.from('articles').delete().eq('id', articleId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success('Article supprimé avec succès');
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
    onError: (error) => {
      toast.error(`Erreur lors de la suppression : ${error.message}`);
    },
  });

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const searchMatch = article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (article.identifier || '').toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = !filters.status || article.status === filters.status;
      const stateMatch = !filters.state || article.state === filters.state;
      const categoryMatch = !filters.category || article.category_id === filters.category;
      return searchMatch && statusMatch && stateMatch && categoryMatch;
    });
  }, [articles, searchTerm, filters]);

  const handleFormClose = () => {
    setIsDialogOpen(false);
    setEditingArticle(null);
    queryClient.invalidateQueries({ queryKey: ['articles'] });
  };
  
  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setIsDialogOpen(true);
  };

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const clearFilters = () => {
    setFilters({ status: '', state: '', category: '' });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Articles</h1>
          <p className="text-gray-600 mt-2">Ajoutez, modifiez ou supprimez des articles.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingArticle(null)} className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Ajouter un Article
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingArticle ? 'Modifier' : 'Nouvel'} Article</DialogTitle>
            </DialogHeader>
            <ArticleForm onClose={handleFormClose} articleId={editingArticle?.id} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4 mb-4">
        <Input
          placeholder="Rechercher par nom ou identifiant..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-full"
        />
        <ArticleFilters
          statusFilter={filters.status}
          stateFilter={filters.state}
          categoryFilter={filters.category}
          onStatusChange={(value) => handleFilterChange('status', value)}
          onStateChange={(value) => handleFilterChange('state', value)}
          onCategoryChange={(value) => handleFilterChange('category', value)}
          onClearFilters={clearFilters}
          categories={categories}
        />
      </div>

      <ArticlesTable 
        articles={filteredArticles}
        isLoading={isLoading}
        onDelete={deleteMutation.mutate}
        isDeleting={deleteMutation.isPending}
        onEdit={handleEdit}
      />
    </div>
  );
}
