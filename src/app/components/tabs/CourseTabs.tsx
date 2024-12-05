// src/app/components/CourseTabs.tsx

import React, { useMemo, useCallback } from 'react';
import MathematicsTab from './MathematicsTab';
import ScienceTab from './ScienceTab';
import CSProjectTab from './CSProjectTab';
import TechnicalElectivesTab from './TechnicalElectivesTab';
import OpenElectivesTab from './OpenElectivesTab';
import { CsSelections } from '@/types/CsSelections'; // Ensure this type is defined appropriately

interface CourseTabsProps {
  major: string;
  csSelections: CsSelections;
  setCSSelections: React.Dispatch<React.SetStateAction<CsSelections>>;
  updateSelectedCourses: (selections: CsSelections) => void;
  handleMathCoursesSelect: (courses: string[]) => void;
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}

interface Tab {
  id: string;
  title: string;
  content: React.ReactNode;
}

const CourseTabs: React.FC<CourseTabsProps> = ({
  major,
  csSelections,
  setCSSelections,
  updateSelectedCourses,
  handleMathCoursesSelect,
  activeTab,
  setActiveTab,
}) => {
  const getTabsForMajor = useCallback((): Tab[] => {
    if (major === 'Computer Science') {
      return [
        {
          id: 'mathematics',
          title: 'Mathematics',
          content: (
            <MathematicsTab
              onSelect={handleMathCoursesSelect}
              selectedCourses={csSelections.mathCourses}
            />
          ),
        },
        {
          id: 'science',
          title: 'Science',
          content: (
            <ScienceTab
              onSelect={(courses) => {
                setCSSelections((prevSelections) => {
                  const newSelections = { ...prevSelections, scienceCourses: courses };
                  updateSelectedCourses(newSelections);
                  return newSelections;
                });
              }}
              selectedCourses={csSelections.scienceCourses}
            />
          ),
        },
        {
          id: 'csProject',
          title: 'CS Project',
          content: (
            <CSProjectTab
              onSelect={(courses) => {
                setCSSelections((prevSelections) => {
                  const newSelections = { ...prevSelections, csProjectCourse: courses };
                  updateSelectedCourses(newSelections);
                  return newSelections;
                });
              }}
              selectedCourses={csSelections.csProjectCourse}
            />
          ),
        },
        {
          id: 'technicalElectives',
          title: 'Technical Electives',
          content: (
            <TechnicalElectivesTab
              onSelect={(courses) => {
                setCSSelections((prevSelections) => {
                  const newSelections = { ...prevSelections, technicalElectives: courses };
                  updateSelectedCourses(newSelections);
                  return newSelections;
                });
              }}
              selectedCourses={csSelections.technicalElectives}
            />
          ),
        },
        {
          id: 'openElectives',
          title: 'Open Electives',
          content: (
            <OpenElectivesTab
              onSelect={(courses) => {
                setCSSelections((prevSelections) => {
                  const newSelections = { ...prevSelections, openElectives: courses };
                  updateSelectedCourses(newSelections);
                  return newSelections;
                });
              }}
              selectedCourses={csSelections.openElectives}
            />
          ),
        },
      ];
    } else if (major === 'Mechanical Engineering') {
      return [
        {
          id: 'mathematics',
          title: 'ME Mathematics',
          content: (
            <MathematicsTab
              onSelect={handleMathCoursesSelect}
              selectedCourses={csSelections.mathCourses}
            />
          ),
        },
        {
          id: 'science',
          title: 'Science',
          content: (
            <ScienceTab
              onSelect={(courses) => {
                setCSSelections((prevSelections) => {
                  const newSelections = { ...prevSelections, scienceCourses: courses };
                  updateSelectedCourses(prevSelections);
                  return newSelections;
                });
              }}
              selectedCourses={csSelections.scienceCourses}
            />
          ),
        },
        {
          id: 'csProject',
          title: 'ME Project',
          content: (
            <CSProjectTab
              onSelect={(courses) => {
                setCSSelections((prevSelections) => {
                  const newSelections = { ...prevSelections, csProjectCourse: courses };
                  updateSelectedCourses(newSelections);
                  return newSelections;
                });
              }}
              selectedCourses={csSelections.csProjectCourse}
            />
          ),
        },
        {
          id: 'technicalElectives',
          title: 'ME Technical Electives',
          content: (
            <TechnicalElectivesTab
              onSelect={(courses) => {
                setCSSelections((prevSelections) => {
                  const newSelections = { ...prevSelections, technicalElectives: courses };
                  updateSelectedCourses(newSelections);
                  return newSelections;
                });
              }}
              selectedCourses={csSelections.technicalElectives}
            />
          ),
        },
        {
          id: 'openElectives',
          title: 'ME Open Electives',
          content: (
            <OpenElectivesTab
              onSelect={(courses) => {
                setCSSelections((prevSelections) => {
                  const newSelections = { ...prevSelections, openElectives: courses };
                  updateSelectedCourses(newSelections);
                  return newSelections;
                });
              }}
              selectedCourses={csSelections.openElectives}
            />
          ),
        },
      ];
    } else if (major === '') {
      return [
        {
          id: 'requirements',
          title: 'Requirements',
          content: <p>Please select a major to see its requirements.</p>,
        },
      ];
    } else {
      return [
        {
          id: 'requirements',
          title: 'Requirements',
          content: (
            <p>
              Major requirements for {major} are not yet implemented.
            </p>
          ),
        },
      ];
    }
  }, [
    major,
    handleMathCoursesSelect,
    csSelections,
    setCSSelections,
    updateSelectedCourses,
  ]);

  const tabs = useMemo(() => getTabsForMajor(), [getTabsForMajor]);

  const renderTabContent = useCallback(() => {
    const activeTabObj = tabs.find((tab) => tab.id === activeTab);
    return activeTabObj ? activeTabObj.content : null;
  }, [tabs, activeTab]);

  return (
    <div className="w-full space-y-4">
      {/* Tabs */}
      <div className="flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 text-sm font-medium transition-colors duration-200 ${
              activeTab === tab.id
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            {tab.title}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      <div className="mt-4">{renderTabContent()}</div>
    </div>
  );
};

export default CourseTabs;
