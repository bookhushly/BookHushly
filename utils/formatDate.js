// Add this helper at the top of your component
export const formatEventDate = (dateString) => {
  if (!dateString) return "Date TBD";

  // Parse as UTC to avoid timezone shifts
  const date = new Date(dateString);
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

  return utcDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Then use it:
