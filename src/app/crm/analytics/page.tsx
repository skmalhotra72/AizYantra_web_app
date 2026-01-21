'use client'

import { BarChart3, TrendingUp, Users, DollarSign, Target, Calendar } from 'lucide-react'

export default function AnalyticsPage() {
  const metrics = [
    { name: 'Total Revenue', value: '₹45.2L', change: '+12.5%', trend: 'up', icon: DollarSign },
    { name: 'New Leads', value: '156', change: '+8.2%', trend: 'up', icon: Users },
    { name: 'Conversion Rate', value: '24%', change: '+2.1%', trend: 'up', icon: Target },
    { name: 'Avg Deal Size', value: '₹8.5L', change: '-1.3%', trend: 'down', icon: TrendingUp },
  ]

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
          <p className="text-slate-600 dark:text-slate-400">Track performance and insights</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-600 dark:text-slate-300">Last 30 days</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((metric) => (
          <div
            key={metric.name}
            className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-teal-100 dark:bg-teal-500/20 rounded-lg flex items-center justify-center">
                <metric.icon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <span className={`text-sm font-medium ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {metric.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{metric.value}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{metric.name}</p>
          </div>
        ))}
      </div>

      {/* Placeholder for charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="text-center text-slate-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chart coming soon</p>
            </div>
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Lead Sources</h3>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
            <div className="text-center text-slate-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chart coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}