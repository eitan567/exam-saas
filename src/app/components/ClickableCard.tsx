import React from 'react';
import Card from './Card';

interface ClickableCardProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

const ClickableCard: React.FC<ClickableCardProps> = ({
  className = '',
  children,
  ...props
}) => {
  return (
    <div role="button" tabIndex={0} {...props}>
      <Card className={className}>
        {children}
      </Card>
    </div>
  );
};

export default ClickableCard;