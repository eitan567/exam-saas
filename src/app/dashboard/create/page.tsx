'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/app/components/Button';
import DashboardHeader from '@/app/components/DashboardHeader';

export default function CreateExamPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader title="Create New Exam">
        <Link href="/dashboard/exams" className="inline-block">
          <Button variant="secondary">
            Cancel
          </Button>
        </Link>
      </DashboardHeader>

      <div className="mt-8">
        {/* Add your exam creation form here */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Exam Details</h2>
          {/* Add form components */}
        </div>
      </div>
    </div>
  );
}