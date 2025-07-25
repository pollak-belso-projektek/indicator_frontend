/**
 * Generates school years dynamically based on the current date
 * Returns the current school year and the previous 3 years
 * School year format: "YYYY/YYYY" (e.g., "2024/2025")
 */
export function generateSchoolYears() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed

  // Determine the current school year
  // School year starts in September (month 9), so if we're before September,
  // we're still in the previous school year
  let currentSchoolYearStart;
  if (currentMonth >= 9) {
    // We're in the fall semester of the new school year
    currentSchoolYearStart = currentYear;
  } else {
    // We're in the spring semester of the current school year
    currentSchoolYearStart = currentYear - 1;
  }

  // Generate 4 school years: current + previous 3
  const schoolYears = [];
  for (let i = 3; i >= 0; i--) {
    const startYear = currentSchoolYearStart - i;
    const endYear = startYear + 1;
    schoolYears.push(`${startYear}/${endYear}`);
  }

  return schoolYears;
}

/**
 * Gets the short format of school years for display in tables
 * Returns format like ["21/22", "22/23", "23/24", "24/25"]
 */
export function generateSchoolYearsShort() {
  const fullYears = generateSchoolYears();
  return fullYears.map((year) => {
    const [start, end] = year.split("/");
    return `${start.slice(-2)}/${end.slice(-2)}`;
  });
}

/**
 * Gets the current school year
 */
export function getCurrentSchoolYear() {
  const years = generateSchoolYears();
  return years[years.length - 1]; // Return the last (most recent) year
}

/**
 * Formats school years with periods (for display purposes)
 * Returns format like ["2021/2022.", "2022/2023.", "2023/2024.", "2024/2025."]
 */
export function generateSchoolYearsWithPeriods() {
  const years = generateSchoolYears();
  return years.map((year) => `${year}.`);
}
