'use client';

import React from 'react';
import Link from 'next/link';
import Button from '@/app/components/Button';
import DashboardHeader from '@/app/components/DashboardHeader';
import Card from '@/app/components/Card';

const MOCK_EXAMS = [
  {
    id: '1',
    title: 'Mathematics Final',
    description: 'Final exam for Mathematics 101',
    created: new Date('2024-02-01').toISOString(),
    status: 'draft'
  },
  {
    id: '2',
    title: 'Physics Mid-term',
    description: 'Mid-term exam for Physics 202',
    created: new Date('2024-01-15').toISOString(),
    status: 'published'
  }
];

export default function ExamsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader title="My Exams">
        <Link href="/dashboard/create" className="inline-block">
          <Button variant="primary">
            Create New Exam
          </Button>
        </Link>
      </DashboardHeader>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_EXAMS.map((exam) => (
          <Card key={exam.id} className="p-4">
            <div className="flex flex-col h-full">
              <div>
                <h3 className="text-lg font-semibold">{exam.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{exam.description}</p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Created: {new Date(exam.created).toLocaleDateString()}
                  </div>
                  <div className={`
                    text-sm font-medium px-2 py-1 rounded-full
                    ${exam.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                    }
                  `}>
                    {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <Link href={`/dashboard/exams/${exam.id}/edit`} className="flex-1">
                    <Button variant="secondary" className="w-full">
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/dashboard/exams/${exam.id}/preview`} className="flex-1">
                    <Button variant="primary" className="w-full">
                      Preview
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}