export const getCurrentSchoolYearStart = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  return currentMonth >= 9 ? currentYear : currentYear - 1;
};
