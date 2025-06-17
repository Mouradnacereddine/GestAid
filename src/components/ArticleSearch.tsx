import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface Article {
  id: string;
  name: string;
  identifier: string;
  [key: string]: any;
}

interface ArticleSearchProps {
  articles: Article[];
  isLoading: boolean;
  selectedArticle: Article | null;
  onSelectArticle: (article: Article | null) => void;
}

export function ArticleSearch({ articles, isLoading, selectedArticle, onSelectArticle }: ArticleSearchProps) {
  const [open, setOpen] = React.useState(false);

  const displayValue = selectedArticle
    ? `${selectedArticle.identifier} - ${selectedArticle.name}`
    : "Sélectionner un article...";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-left"
        >
          <span className="truncate">{displayValue}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
        <Command>
          <CommandInput placeholder="Rechercher un article..." />
          <CommandList>
            <CommandEmpty>{isLoading ? "Chargement..." : "Aucun article trouvé."}</CommandEmpty>
            <CommandGroup>
              {articles?.map((article) => (
                <CommandItem
                  key={article.id}
                  value={`${article.identifier} - ${article.name}`}
                  onSelect={() => {
                    onSelectArticle(article.id === selectedArticle?.id ? null : article);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedArticle?.id === article.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {article.identifier} - {article.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
