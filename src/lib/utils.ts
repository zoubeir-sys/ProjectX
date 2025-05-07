// IT APPEARS THAT BIG CALENDAR SHOWS THE LAST WEEK WHEN THE CURRENT DAY IS A WEEKEND.
// FOR THIS REASON WE'LL GET THE LAST WEEK AS THE REFERENCE WEEK.
// IN THE TUTORIAL WE'RE TAKING THE NEXT WEEK AS THE REFERENCE WEEK.

const getLatestMonday = (): Date => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const latestMonday = today;
  latestMonday.setDate(today.getDate() - daysSinceMonday);
  return latestMonday;
};

export const adjustScheduleToCurrentWeek = (
  lessons: { title: string; start: Date; end: Date }[]
): { title: string; start: Date; end: Date }[] => {
  const latestMonday = getLatestMonday();

  return lessons.map((lesson) => {
    const lessonDayOfWeek = lesson.start.getDay();

    const daysFromMonday = lessonDayOfWeek === 0 ? 6 : lessonDayOfWeek - 1;

    const adjustedStartDate = new Date(latestMonday);

    adjustedStartDate.setDate(latestMonday.getDate() + daysFromMonday);
    adjustedStartDate.setHours(
      lesson.start.getHours(),
      lesson.start.getMinutes(),
      lesson.start.getSeconds()
    );
    const adjustedEndDate = new Date(adjustedStartDate);
    adjustedEndDate.setHours(
      lesson.end.getHours(),
      lesson.end.getMinutes(),
      lesson.end.getSeconds()
    );

    return {
      title: lesson.title,
      start: adjustedStartDate,
      end: adjustedEndDate,
    };
  });
};

// Add these utility functions for date and time formatting
export const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("fr-FR");
};

export const formatTime = (startTime: Date, endTime: Date) => {
  const start = new Date(startTime).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const end = new Date(endTime).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${start} - ${end}`;
};

// Client-side utility functions

export function formatPdfUrl(pdfUrl: string): string {
  if (!pdfUrl) return '';
  
  // For Cloudinary PDFs, we need to use the correct delivery type
  // The format should be: https://res.cloudinary.com/[cloud_name]/image/upload/fl_attachment/[file_path]
  if (pdfUrl.includes('cloudinary.com')) {
    // Add fl_attachment parameter to force download
    if (pdfUrl.includes('/upload/')) {
      // Check if there's already a transformation
      if (pdfUrl.includes('/upload/v')) {
        // Insert fl_attachment before the version number
        const parts = pdfUrl.split('/upload/v');
        return `${parts[0]}/upload/fl_attachment/v${parts[1]}`;
      } else {
        // No version number, just add fl_attachment
        return pdfUrl.replace('/upload/', '/upload/fl_attachment/');
      }
    }
  }
  
  // If no transformation needed, return the original URL
  return pdfUrl;
}


