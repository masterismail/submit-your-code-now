
import React from 'react';
import { Button } from '@/components/ui/button';
import { Wrench } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface FixButtonProps {
  label: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onClick?: () => void;
}

const FixButton = ({ 
  label, 
  variant = 'default', 
  size = 'default',
  className = '',
  onClick
}: FixButtonProps) => {
  const { toast } = useToast();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      toast({
        title: "Fix initiated",
        description: `Starting fix process for: ${label}`,
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`animate-pulse-glow ${className}`}
      onClick={handleClick}
    >
      <Wrench className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
};

export default FixButton;
