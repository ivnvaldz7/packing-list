import logoUrl from '../assets/ale-bet-logo.png';

type LaboratoryLogoProps = {
  className?: string;
  laboratoryName: string;
};

export const LaboratoryLogo = ({ className }: LaboratoryLogoProps) => (
  <div className={className}>
    <img className="laboratory-logo-image" src={logoUrl} alt="Ale-Bet" />
  </div>
);
