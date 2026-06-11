'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { BreadcrumbStructuredData } from './structured-data';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  const allItems = [{ name: 'Home', url: '/' }, ...items];

  return (
    <>
      <BreadcrumbStructuredData items={allItems} />
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-6 ${className}`}
      >
        <Link
          href="/"
          className="flex items-center hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <Home className="h-4 w-4" />
          <span className="sr-only">Home</span>
        </Link>
        
        {items.map((item, index) => (
          <div key={item.url} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
            {index === items.length - 1 ? (
              <span
                className="text-gray-900 dark:text-gray-100 font-medium"
                aria-current="page"
              >
                {item.name}
              </span>
            ) : (
              <Link
                href={item.url}
                className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </>
  );
}