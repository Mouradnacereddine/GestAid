
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface CategorySummaryData {
  category: string;
  recettes: number;
  depenses: number;
  total: number;
}

interface CategorySummaryTableProps {
  data: CategorySummaryData[];
  totalRevenue: number;
  totalExpenses: number;
  netResult: number;
}

export function CategorySummaryTable({
  data,
  totalRevenue,
  totalExpenses,
  netResult
}: CategorySummaryTableProps) {
  console.log('=== CategorySummaryTable RENDER START ===');
  console.log('CategorySummaryTable - Props received:');
  console.log('  - data:', data);
  console.log('  - data length:', data?.length);
  console.log('  - data type:', typeof data);
  console.log('  - data is array:', Array.isArray(data));
  console.log('  - totalRevenue:', totalRevenue);
  console.log('  - totalExpenses:', totalExpenses);
  console.log('  - netResult:', netResult);
  
  if (data && Array.isArray(data)) {
    console.log('CategorySummaryTable - Processing data array:');
    data.forEach((item, index) => {
      console.log(`  Item ${index}:`, {
        category: item?.category,
        recettes: item?.recettes,
        depenses: item?.depenses,
        total: item?.total,
        rawItem: item
      });
    });
  } else {
    console.log('CategorySummaryTable - Data is not a valid array:', data);
  }

  // Assurer que les données sont valides avant le rendu
  const validData = Array.isArray(data) ? data : [];
  const hasData = validData.length > 0;

  console.log('CategorySummaryTable - About to render table with:');
  console.log('  - validData:', validData);
  console.log('  - hasData:', hasData);
  console.log('  - validData.length:', validData.length);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Récapitulatif par Catégorie</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Catégorie</TableHead>
              <TableHead className="text-right">Recettes</TableHead>
              <TableHead className="text-right">Dépenses</TableHead>
              <TableHead className="text-right">Solde</TableHead>
              <TableHead className="text-center">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hasData ? (
              validData.map((category, index) => {
                console.log(`CategorySummaryTable - About to render row ${index + 1}:`, category);
                const categoryName = category?.category || 'Catégorie inconnue';
                const recettes = category?.recettes || 0;
                const depenses = category?.depenses || 0;
                const total = category?.total || 0;
                
                console.log(`CategorySummaryTable - Row ${index + 1} values:`, {
                  categoryName,
                  recettes,
                  depenses,
                  total
                });
                
                return (
                  <TableRow key={`${categoryName}-${index}`}>
                    <TableCell className="font-medium">
                      {categoryName}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {recettes.toLocaleString('fr-FR')} €
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {depenses.toLocaleString('fr-FR')} €
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {total.toLocaleString('fr-FR')} €
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={total >= 0 ? 'default' : 'destructive'}
                        className={total >= 0 ? 'bg-green-100 text-green-800' : ''}
                      >
                        {total >= 0 ? 'Positif' : 'Négatif'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <>
                {console.log('CategorySummaryTable - Rendering empty state because hasData is false')}
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    Aucune donnée disponible pour la période sélectionnée
                  </TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
          <TableFooter>
            <TableRow className="font-bold bg-gray-50">
              <TableCell>TOTAL</TableCell>
              <TableCell className="text-right text-green-600">
                {(totalRevenue || 0).toLocaleString('fr-FR')} €
              </TableCell>
              <TableCell className="text-right text-red-600">
                {(totalExpenses || 0).toLocaleString('fr-FR')} €
              </TableCell>
              <TableCell className={`text-right ${(netResult || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(netResult || 0).toLocaleString('fr-FR')} €
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={(netResult || 0) >= 0 ? 'default' : 'destructive'}>
                  {(netResult || 0) >= 0 ? 'Bénéfice' : 'Déficit'}
                </Badge>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
