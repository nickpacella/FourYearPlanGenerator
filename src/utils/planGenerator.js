function generateFourYearPlan(major, electives, minors) {
  const plan = Array.from({ length: 8 }, () => []); // 8 semesters, each initialized to an empty array
  const completedCourses = new Set(); // Track completed courses
  const maxClassesPerSemester = 5;

  // get core courses for the major
  let remainingCourses = [...(coreCoursesByMajor[major] || []), ...electives, ...minors];

  // helper function to check if prerequisites are completed
  const canTakeCourse = (course) => {
    const prereqs = prerequisites[course] || [];
    return prereqs.every((prereq) => completedCourses.has(prereq));
  };

  // Schedule the courses over 8 semesters
  for (let semester = 0; semester < 8; semester++) {
    let semesterClasses = []; // Initialize a new array for each semester

    // Filter the remaining courses to see which can be taken this semester
    remainingCourses = remainingCourses.filter((course) => {
      if (semesterClasses.length >= maxClassesPerSemester) return true; // If the semester is full, carry this course over

      // Only schedule the course if its prerequisites are met
      if (canTakeCourse(course)) {
        semesterClasses.push(course);
        completedCourses.add(course); // Mark the course as completed
        return false; // Remove the course from the remainingCourses list
      }

      return true; // Keep the course in remainingCourses if prerequisites aren't met yet
    });

    // Assign the courses to the semester
    plan[semester] = semesterClasses;

    // If no more courses are left to schedule, exit early
    if (remainingCourses.length === 0) break;
  }

  return plan;
}
