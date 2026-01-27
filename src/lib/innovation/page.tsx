"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Lightbulb, 
  Plus, 
  TrendingUp, 
  Users, 
  CheckCircle2,
  Clock,
  Sparkles
} from "lucide-react";
import { getIdeas, getWorkflowStages } from "@/lib/innovation/i2e-db";
import type { Idea, WorkflowStage } from "@/lib/innovation/i2e-db";

export default function InnovationDashboard() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [stages, setStages] = useState<WorkflowStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [ideasData, stagesData] = await Promise.all([
      getIdeas(),
      getWorkflowStages(),
    ]);
    setIdeas(ideasData);
    setStages(stagesData);
    setIsLoading(false);
  };

  const getStageColor = (stageNumber: number) => {
    if (stageNumber <= 2) return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    if (stageNumber <= 5) return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    if (stageNumber === 7) return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    if (stageNumber <= 9) return "bg-green-500/10 text-green-500 border-green-500/20";
    return "bg-sky-500/10 text-sky-500 border-sky-500/20";
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-sky/10 text-sky border-sky/20",
      approved: "bg-green-500/10 text-green-500 border-green-500/20",
      declined: "bg-red-500/10 text-red-500 border-red-500/20",
      on_hold: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      completed: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    };
    return styles[status as keyof typeof styles] || styles.active;
  };

  const stats = {
    total: ideas.length,
    active: ideas.filter((i) => i.status === "active").length,
    approved: ideas.filter((i) => i.status === "approved").length,
    inVoting: ideas.filter((i) => i.current_stage === 7).length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-sky animate-pulse mx-auto mb-4" />
          <p className="text-subtext-1">Loading innovation pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-base">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">
              Innovation <span className="text-sky">Pipeline</span>
            </h1>
            <p className="text-subtext-1">
              Ideas from submission to execution
            </p>
          </div>

          <button
            onClick={() => router.push("/innovation/ideas/new")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-sky text-base hover:bg-sky/90 transition-all"
          >
            <Plus className="w-5 h-5" />
            Submit Idea
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-surface-0 border border-surface-1"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-subtext-1 text-sm">Total Ideas</span>
              <Lightbulb className="w-5 h-5 text-sky" />
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
              <span className="text-subtext-1 text-sm">Active</span>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-text">{stats.active}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-surface-0 border border-surface-1"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-subtext-1 text-sm">In Voting</span>
              <Users className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-text">{stats.inVoting}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-surface-0 border border-surface-1"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-subtext-1 text-sm">Approved</span>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-text">{stats.approved}</p>
          </motion.div>
        </div>

        {/* Ideas List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-text mb-4">All Ideas</h2>

          {ideas.length === 0 ? (
            <div className="text-center py-16">
              <Lightbulb className="w-16 h-16 text-subtext-0 mx-auto mb-4" />
              <p className="text-lg text-subtext-1 mb-2">No ideas yet</p>
              <p className="text-sm text-subtext-0 mb-6">Be the first to submit an idea!</p>
              <button
                onClick={() => router.push("/innovation/ideas/new")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky text-base hover:bg-sky/90 transition-all"
              >
                <Plus className="w-5 h-5" />
                Submit Your First Idea
              </button>
            </div>
          ) : (
            ideas.map((idea, index) => {
              const stage = stages.find((s) => s.stage_number === idea.current_stage);

              return (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => router.push(`/innovation/ideas/${idea.id}`)}
                  className="p-6 rounded-2xl bg-surface-0 border border-surface-1 hover:border-sky/50 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-text mb-2">
                        {idea.title}
                      </h3>
                      <p className="text-sm text-subtext-1 line-clamp-2">
                        {idea.problem_statement}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(idea.status)}`}>
                        {idea.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-subtext-0">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(idea.created_at).toLocaleDateString()}
                      </div>
                      {idea.industry_category && (
                        <span className="px-2 py-1 rounded bg-surface-1 text-xs">
                          {idea.industry_category}
                        </span>
                      )}
                    </div>

                    {stage && (
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStageColor(stage.stage_number)}`}>
                        Stage {stage.stage_number}: {stage.name}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}