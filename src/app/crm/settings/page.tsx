'use client'

import { User, Bell, Shield, Palette, Database } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400">Manage your account and preferences</p>
      </div>

      <div className="grid gap-4">
        <div className="flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded-xl">
          <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Profile Settings</h3>
            <p className="text-sm text-slate-400">Manage your personal information</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded-xl">
          <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center">
            <Bell className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Notifications</h3>
            <p className="text-sm text-slate-400">Configure email and push notifications</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded-xl">
          <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Security</h3>
            <p className="text-sm text-slate-400">Password and two-factor authentication</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded-xl">
          <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center">
            <Palette className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Appearance</h3>
            <p className="text-sm text-slate-400">Theme and display preferences</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded-xl">
          <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center">
            <Database className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Data and Privacy</h3>
            <p className="text-sm text-slate-400">Export data and privacy settings</p>
          </div>
        </div>
      </div>
    </div>
  )
}