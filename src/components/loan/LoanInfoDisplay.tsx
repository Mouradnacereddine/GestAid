
import React from 'react';

interface LoanInfoDisplayProps {
  loan: any;
}

export function LoanInfoDisplay({ loan }: LoanInfoDisplayProps) {
  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
      <h3 className="font-medium mb-2">Informations du prêt</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium">Bénéficiaire:</span> {loan.beneficiaries?.first_name} {loan.beneficiaries?.last_name}
        </div>
        <div>
          <span className="font-medium">Date de retour prévue:</span> {new Date(loan.expected_return_date).toLocaleDateString('fr-FR')}
        </div>
      </div>
    </div>
  );
}
