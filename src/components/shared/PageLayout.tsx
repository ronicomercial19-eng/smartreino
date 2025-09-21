/**
 * Layout padrão para páginas do sistema
 * Padroniza estrutura e espaçamentos
 */

import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageLayout({ 
  children, 
  title, 
  subtitle, 
  actions, 
  className 
}: PageLayoutProps) {
  return (
    <AppLayout>
      <div className={cn('space-y-6', className)}>
        {(title || subtitle || actions) && (
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {title && (
                <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
          </div>
        )}
        
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </AppLayout>
  );
}

export default PageLayout;