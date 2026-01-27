"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lightbulb, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { createIdea, logActivity } from "@/lib/innovation/i2e-db";

export default function NewIdeaPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    problem_statement: "",
    proposed_solution: "",
    target_users: "",
    why_now: "",
    industry_category: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // TODO: Get actual user ID from auth
      const userId = "temp-user-id"; // Replace with real auth

      const { idea, error: createError } = await createIdea({
        ...formData,
        created_by: userId,
      });

      if (createError || !idea) {
        throw new Error(createError || "Failed to create idea");
      }

      // Log activity
      await logActivity(idea.id, userId, "idea_submitted", `Idea "${formData.title}" submitted`);

      // Redirect to idea details page
      router.push(`/innovation/ideas/${idea.id}`);
    } catch (err: any) {
      console.error("Error submitting idea:", err);
      setError(err.message || "Failed to submit idea. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <main className="min-h-screen bg-base">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-sky/30 bg-sky/10 mb-4">
            <Sparkles className="w-4 h-4 text-sky" />
            <span className="text-sm font-medium text-sky">Innovation Pipeline</span>
          </div>

          <h1 className="text-4xl font-bold text-text mb-4">
            Submit Your <span className="text-sky">Idea</span>
          </h1>

          <p className="text-lg text-subtext-1 max-w-2xl mx-auto">
            Share your idea with the team. It will go through AI-powered evaluation before founder voting.
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-3xl mx-auto"
        >
          <div className="bg-surface-0 rounded-2xl border border-surface-1 p-8">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-text mb-2">
                  Idea Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., AI-Powered Customer Support Chatbot"
                  className="w-full px-4 py-3 rounded-xl bg-surface-1 border border-surface-2 text-text placeholder-subtext-0 focus:outline-none focus:ring-2 focus:ring-sky"
                />
              </div>

              {/* Problem Statement */}
              <div>
                <label htmlFor="problem_statement" className="block text-sm font-medium text-text mb-2">
                  What problem does this solve? *
                </label>
                <textarea
                  id="problem_statement"
                  name="problem_statement"
                  required
                  value={formData.problem_statement}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the problem your target users are facing..."
                  className="w-full px-4 py-3 rounded-xl bg-surface-1 border border-surface-2 text-text placeholder-subtext-0 focus:outline-none focus:ring-2 focus:ring-sky resize-none"
                />
              </div>

              {/* Target Users */}
              <div>
                <label htmlFor="target_users" className="block text-sm font-medium text-text mb-2">
                  Who is this for? *
                </label>
                <input
                  type="text"
                  id="target_users"
                  name="target_users"
                  required
                  value={formData.target_users}
                  onChange={handleChange}
                  placeholder="e.g., Small business owners, Healthcare providers"
                  className="w-full px-4 py-3 rounded-xl bg-surface-1 border border-surface-2 text-text placeholder-subtext-0 focus:outline-none focus:ring-2 focus:ring-sky"
                />
              </div>

              {/* Proposed Solution */}
              <div>
                <label htmlFor="proposed_solution" className="block text-sm font-medium text-text mb-2">
                  Proposed Solution (Optional)
                </label>
                <textarea
                  id="proposed_solution"
                  name="proposed_solution"
                  value={formData.proposed_solution}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe your proposed solution..."
                  className="w-full px-4 py-3 rounded-xl bg-surface-1 border border-surface-2 text-text placeholder-subtext-0 focus:outline-none focus:ring-2 focus:ring-sky resize-none"
                />
              </div>

              {/* Why Now */}
              <div>
                <label htmlFor="why_now" className="block text-sm font-medium text-text mb-2">
                  Why Now? (Optional)
                </label>
                <textarea
                  id="why_now"
                  name="why_now"
                  value={formData.why_now}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Why is this the right time for this idea?"
                  className="w-full px-4 py-3 rounded-xl bg-surface-1 border border-surface-2 text-text placeholder-subtext-0 focus:outline-none focus:ring-2 focus:ring-sky resize-none"
                />
              </div>

              {/* Industry Category */}
              <div>
                <label htmlFor="industry_category" className="block text-sm font-medium text-text mb-2">
                  Industry Category (Optional)
                </label>
                <select
                  id="industry_category"
                  name="industry_category"
                  value={formData.industry_category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-surface-1 border border-surface-2 text-text focus:outline-none focus:ring-2 focus:ring-sky"
                >
                  <option value="">Select an industry...</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Education">Education</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Retail">Retail</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Info Box */}
              <div className="p-4 rounded-xl bg-sky/10 border border-sky/20">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-sky flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-subtext-1">
                    <p className="font-medium text-text mb-1">What happens next?</p>
                    <p>
                      Your idea will be anonymously submitted and go through AI-powered evaluation
                      across market research, trend analysis, and feasibility assessment before
                      reaching the founder voting stage.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-surface-1 text-subtext-1 hover:text-text hover:bg-surface-2 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-sky text-base hover:bg-sky/90 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-base border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Idea
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </main>
  );
}