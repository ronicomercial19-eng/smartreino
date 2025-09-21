/**
 * Template base para componentes padronizados
 * Segue as diretrizes do design system
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ComponentTemplateProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'compact' | 'elevated';
  loading?: boolean;
}

export function ComponentTemplate({
  title,
  description,
  children,
  className,
  variant = 'default',
  loading = false
}: ComponentTemplateProps) {
  const variants = {
    default: 'bg-card border-border',
    compact: 'bg-card border-border p-4',
    elevated: 'bg-card border-border shadow-lg'
  };

  if (loading) {
    return (
      <Card className={cn(variants[variant], className)}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(variants[variant], className)}>
      {(title || description) && (
        <CardHeader>
          {title && (
            <CardTitle className="text-foreground font-heading">
              {title}
            </CardTitle>
          )}
          {description && (
            <CardDescription className="text-muted-foreground">
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

export default ComponentTemplate;