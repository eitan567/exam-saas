'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/app/components/Button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                Exam Builder
              </Link>
              <nav className="ml-10 flex items-center space-x-4">
                <Link 
                  href="/dashboard" 
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  Overview
                </Link>
                <Link 
                  href="/dashboard/exams" 
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  My Exams
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="primary" size="sm">
                Create New Exam
              </Button>
              <button className="text-gray-500 hover:text-gray-900">
                <span className="sr-only">User menu</span>
                <svg 
                  className="h-8 w-8 rounded-full bg-gray-100 p-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <p className="text-center text-sm text-gray-500">
              © 2025 Exam Builder. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}