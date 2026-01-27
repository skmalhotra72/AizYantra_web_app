"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Brain, 
  TrendingUp, 
  Building2, 
  Mail, 
  Phone,
  Calendar,
  ArrowRight,
  Search,
  Filter
} from "lucide-react";
import { supabase } from "@/lib/innovation/i2e-db";
import AssessmentModal from "@/components/crm/AssessmentModal";

interface AssessmentLead {
  id: string;
  lead_number: string;
  score: number;
  ai_readiness_score: number;
  status: string;
  priority: string;
  contact_name: string;
  email: string;
  phone?: string;
  organization_name: string;
  industry?: string;
  created_at: string;
  assessment_id?: string;
}

export default function AIAssessmentLeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<AssessmentLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadAssessmentLeads();
  }, []);

  const loadAssessmentLeads = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          id,
          lead_number,
          score,
          ai_readiness_score,
          status,
          priority,
          created_at,
          assessment_id:assessment_user_id,
          contact:contact_id (
            name,
            email,
            phone
          ),
          organization:organization_id (
            name,
            industry
          )
        `)
        .eq('source', 'ai_assessment')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedLeads = (data || []).map((lead: any) => ({
        id: lead.id,
        lead_number: lead.lead_number,
        score: lead.score,
        ai_readiness_score: lead.ai_readiness_score,
        status: lead.status,
        priority: lead.priority,
        contact_name: lead.contact?.name || 'Unknown',
        email: lead.contact?.email || '',
        phone: lead.contact?.phone,
        organization_name: lead.organization?.name || 'Unknown',
        industry: lead.organization?.industry,
        created_at: lead.created_at,
        assessment_id: lead.assessment_id,
      }));

      setLeads(formattedLeads);
    } catch (error) {
      console.error('Error loading assessment leads:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getReadinessLevel = (score: number): { label: string; color: string } => {
    if (score >= 80) return { label: 'Leader', color: 'text-green-500 bg-green-500/10 border-green-500/20' };
    if (score >= 65) return { label: 'Advanced', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
    if (score >= 50) return { label: 'Established', color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' };
    if (score >= 35) return { label: 'Developing', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' };
    return { label: 'Beginner', color: 'text-red-500 bg-red-500/10 border-red-500/20' };
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'text-red-500 bg-red-500/10 border-red-500/20',
      medium: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
      low: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  const filteredLeads = leads.filter(lead => 
    lead.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.lead_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: leads.length,
    avgScore: leads.length > 0 
      ? Math.round(leads.reduce((sum, l) => sum + l.ai_readiness_score, 0) / leads.length)
      : 0,
    highPriority: leads.filter(l => l.priority === 'high').length,
    leader: leads.filter(l => l.ai_readiness_score >= 80).length,
  };

  const handleViewAssessment = (e: React.MouseEvent, leadId: string) => {
    e.stopPropagation();
    setSelectedLeadId(leadId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLeadId(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-sky animate-pulse mx-auto mb-4" />
          <p className="text-subtext-1">Loading AI assessment leads...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-base">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-6 h-6 text-sky" />
            <h1 className="text-3xl font-bold text-text">
              AI Assessment <span className="text-sky">Leads</span>
            </h1>
          </div>
          <p className="text-subtext-1">
            Leads generated from AI Readiness Assessments
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-surface-0 border border-surface-1"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-subtext-1 text-sm">Total Assessments</span>
              <Brain className="w-5 h-5 text-sky" />
            </div>
            <p className="text-3xl font-bold text-text">{stats.total}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-surface-0 border border-surface-1"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-subtext-1 text-sm">Avg AI Score</span>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-text">{stats.avgScore}/100</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-surface-0 border border-surface-1"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-subtext-1 text-sm">High Priority</span>
              <Filter className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-text">{stats.highPriority}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-surface-0 border border-surface-1"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-subtext-1 text-sm">AI Leaders</span>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-text">{stats.leader}</p>
          </motion.div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-subtext-0" />
            <input
              type="text"
              placeholder="Search by name, organization, email, or lead number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface-0 border border-surface-1 text-text placeholder-subtext-0 focus:outline-none focus:ring-2 focus:ring-sky"
            />
          </div>
        </div>

        {/* Leads List */}
        {filteredLeads.length === 0 ? (
          <div className="text-center py-16 bg-surface-0 rounded-2xl border border-surface-1">
            <Brain className="w-16 h-16 text-subtext-0 mx-auto mb-4" />
            <p className="text-lg text-subtext-1 mb-2">
              {searchTerm ? "No leads found matching your search" : "No AI assessment leads yet"}
            </p>
            <p className="text-sm text-subtext-0">
              {searchTerm ? "Try a different search term" : "Leads will appear here when users complete the AI readiness assessment"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLeads.map((lead, index) => {
              const readiness = getReadinessLevel(lead.ai_readiness_score);

              return (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 rounded-2xl bg-surface-0 border border-surface-1 hover:border-sky/50 transition-all cursor-pointer"
                  onClick={(e) => handleViewAssessment(e, lead.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-text">
                          {lead.organization_name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${readiness.color}`}>
                          {readiness.label} ({lead.ai_readiness_score}/100)
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(lead.priority)}`}>
                          {lead.priority} priority
                        </span>
                      </div>
                      <p className="text-sm text-subtext-0 mb-3">
                        Lead: {lead.lead_number}
                      </p>
                    </div>

                    <button
                      onClick={(e) => handleViewAssessment(e, lead.id)}
                      className="px-4 py-2 rounded-xl bg-sky/10 text-sky hover:bg-sky/20 transition-all flex items-center gap-2"
                    >
                      View Assessment
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-subtext-0 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-text">{lead.contact_name}</p>
                        <p className="text-xs text-subtext-0">{lead.email}</p>
                      </div>
                    </div>

                    {lead.phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 text-subtext-0 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-text">Phone</p>
                          <p className="text-xs text-subtext-0">{lead.phone}</p>
                        </div>
                      </div>
                    )}

                    {lead.industry && (
                      <div className="flex items-start gap-3">
                        <Building2 className="w-4 h-4 text-subtext-0 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-text">Industry</p>
                          <p className="text-xs text-subtext-0">{lead.industry}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-subtext-0 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-text">Completed</p>
                        <p className="text-xs text-subtext-0">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assessment Detail Modal */}
      {isModalOpen && selectedLeadId && (
        <AssessmentModal 
          leadId={selectedLeadId}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </main>
  );
}