import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, FileText, Loader2, ChevronRight } from 'lucide-react';
import { AcademicResourceExtended, ResourceRecommendation } from '@/types/academicbank';

interface RecommendationsPanelProps {
  currentResource: AcademicResourceExtended;
  recommendations: ResourceRecommendation[];
  resources: AcademicResourceExtended[];
  isLoading?: boolean;
  onResourceClick?: (resource: AcademicResourceExtended) => void;
}

export const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({
  currentResource,
  recommendations,
  resources,
  isLoading = false,
  onResourceClick
}) => {
  const [displayRecommendations, setDisplayRecommendations] = useState<AcademicResourceExtended[]>([]);

  useEffect(() => {
    if (recommendations && recommendations.length > 0) {
      // Map recommendation IDs to actual resources
      const recommended = recommendations
        .slice(0, 5) // Show top 5
        .map(rec => resources.find(r => r.id === rec.related_resource_id))
        .filter(Boolean) as AcademicResourceExtended[];
      
      setDisplayRecommendations(recommended);
    }
  }, [recommendations, resources]);

  if (!displayRecommendations.length && !isLoading) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6 mt-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Lightbulb size={20} className="text-blue-600" />
        </div>
        <h3 className="font-semibold text-slate-900">Recommended Materials</h3>
      </div>

      <p className="text-sm text-slate-600 mb-4">
        Based on your interest in <span className="font-medium">{currentResource.course_code || currentResource.name}</span>, 
        you might also find these helpful:
      </p>

      <AnimatePresence>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-2">
            {displayRecommendations.map((resource, index) => (
              <motion.button
                key={resource.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onResourceClick?.(resource)}
                className="w-full flex items-start gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-all group"
              >
                <div className="mt-1">
                  <FileText size={18} className="text-indigo-600 group-hover:text-indigo-700" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                    {resource.name}
                  </p>
                  {resource.course_code && (
                    <p className="text-xs text-slate-500">{resource.course_code}</p>
                  )}
                  {resource.view_count !== undefined && (
                    <p className="text-xs text-slate-400 mt-1">
                      {resource.view_count} views
                    </p>
                  )}
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0 mt-1" />
              </motion.button>
            ))}
          </div>
        )}
      </AnimatePresence>

      <p className="text-xs text-slate-500 mt-4 italic">
        Recommendations based on course similarity and user interactions
      </p>
    </motion.div>
  );
};
