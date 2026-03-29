type LaboratoryLogoProps = {
  className?: string;
  laboratoryName: string;
};

export const LaboratoryLogo = ({ className, laboratoryName }: LaboratoryLogoProps) => (
  <div className={className}>
    <div className="laboratory-logo-mark" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
    <div className="laboratory-logo-copy">
      <strong>{laboratoryName}</strong>
      <small>Lista de empaque</small>
    </div>
  </div>
);
