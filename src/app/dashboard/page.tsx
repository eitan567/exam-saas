'use client';

import React from 'react';
import Link from 'next/link';
import Card from '@/app/components/Card';
import Button from '@/app/components/Button';

interface StatsCard {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
}

const stats: StatsCard[] = [
  { label: 'Total Exams', value: 12, change: 23, trend: 'up' },
  { label: 'Active Exams', value: 4, change: 15, trend: 'up' },
  { label: 'Student Responses', value: 245, change: -5, trend: 'down' },
  { label: 'Average Score', value: 85, change: 10, trend: 'up' },
];

const recentActivity = [
  {
    id: 1,
    type: 'exam_created',
    title: 'Mathematics Final Exam',
    date: '2h ago',
  },
  {
    id: 2,
    type: 'exam_published',
    title: 'Physics Mid-term',
    date: '4h ago',
  },
  {
    id: 3,
    type: 'student_completed',
    title: 'Biology Quiz',
    date: '6h ago',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
        <div className="mt-4 sm:mt-0">
          <Link href="/dashboard/create">
            <Button variant="primary">Create New Exam</Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="px-4 py-5">
            <dt className="text-sm font-medium text-gray-500 truncate">{stat.label}</dt>
            <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
              <div className="flex items-baseline text-2xl font-semibold text-gray-900">
                {stat.value}
              </div>
              <div className={`
                inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium
                ${stat.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
              `}>
                {stat.trend === 'up' ? '↑' : '↓'} {Math.abs(stat.change)}%
              </div>
            </dd>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          <div className="mt-6 flow-root">
            <ul className="-my-5 divide-y divide-gray-200">
              {recentActivity.map((item) => (
                <li key={item.id} className="py-5">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <span className={`
                        inline-flex items-center justify-center h-8 w-8 rounded-full
                        ${item.type === 'exam_created' ? 'bg-blue-100' : 
                          item.type === 'exam_published' ? 'bg-green-100' : 'bg-purple-100'}
                      `}>
                        {item.type === 'exam_created' ? '📝' : 
                         item.type === 'exam_published' ? '📢' : '✅'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.type.split('_').join(' ')}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-sm text-gray-500">
                      {item.date}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6">
            <Link href="/dashboard/activity">
              <Button variant="secondary" fullWidth>
                View All Activity
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}