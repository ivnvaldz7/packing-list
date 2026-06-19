import type { ShipmentDocument } from '../types';
import { PalletLabels } from '../components/PalletLabel';

type CartelesViewProps = {
  document: ShipmentDocument;
  labelCount: number;
  onLabelCountChange: (count: number) => void;
};

export const CartelesView = ({ document, labelCount, onLabelCountChange }: CartelesViewProps) => {
  const handlePrint = () => {
    window.document.body.classList.add('printing-labels-only');
    window.print();
  };

  return (
    <section className="mb-8 animate-stage-in">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-stone-800 dark:text-stone-100">
          Carteles para pallets
        </h2>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Genera los carteles de exportación para cada pallet. Imprimilos antes de cargar la
          mercadería.
        </p>
      </div>
      <PalletLabels
        document={document}
        labelCount={labelCount}
        onLabelCountChange={onLabelCountChange}
        onPrint={handlePrint}
      />
    </section>
  );
};
