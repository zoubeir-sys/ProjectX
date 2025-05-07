import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import UserCard from "@/components/UserCard";
import ClassCapacityChartContainer from "@/components/ClassCapacityChartContainer";
import ClassScoresChartContainer from "@/components/ClassScoresChartContainer";
import StudentTeacherRatioChartContainer from "@/components/StudentTeacherRatioChartContainer";

const AdminPage = ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        
        {/* MIDDLE CHARTS */}
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* COUNT CHART */}
          <div className="w-full lg:w-1/3 h-[450px]">
            <CountChartContainer />
          </div>
          {/* ATTENDANCE CHART */}
          <div className="w-full lg:w-2/3 h-[450px]">
            <AttendanceChartContainer />
          </div>
        </div>
        {/* BOTTOM CHART */}
        <div className="w-full h-[500px]">
          <ClassCapacityChartContainer />
        </div>
        <div className="w-full h-[500px]">
          <StudentTeacherRatioChartContainer />
        </div>
        <div className="w-full h-[500px]">
          <ClassScoresChartContainer />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <EventCalendarContainer searchParams={searchParams}/>
        <Announcements />
        {/* USER CARDS */}
        <div className="flex gap-4 justify-between flex-wrap">
          <UserCard type="admin" />
          <UserCard type="teacher" />
          <UserCard type="student" />
          {/*<UserCard type="parent" />*/}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
