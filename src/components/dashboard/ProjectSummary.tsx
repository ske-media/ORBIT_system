import React from 'react';
import { Project } from '../../types/project';
import { FolderKanban, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

interface ProjectSummaryProps {
  projects: Project[];
}

export function ProjectSummary({ projects }: ProjectSummaryProps) {
  const navigate = useNavigate();
  const inProgressProjects = projects.filter(
    project => project.status === 'in_progress' || project.status === 'not_started'
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FolderKanban className="h-6 w-6 text-indigo-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Projets en cours</h2>
        </div>
        <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {inProgressProjects.length}
        </span>
      </div>

      <div className="space-y-4">
        {inProgressProjects.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucun projet en cours</p>
        ) : (
          inProgressProjects.map(project => (
            <div 
              key={project.id} 
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200"
              onClick={() => navigate(`/projects`)}
            >
              <div>
                <h3 className="text-sm font-medium text-gray-900">{project.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                <div className="mt-2">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 ml-2">{project.progress}%</span>
                  </div>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}