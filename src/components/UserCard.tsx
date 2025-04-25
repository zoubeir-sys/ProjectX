import prisma from "@/lib/prisma";
import Image from "next/image";

const UserCard = async ({
  type,
}: {
  type: "admin" | "teacher" | "student" | "parent";
}) => {
  const modelMap: Record<typeof type, any> = {
    admin: prisma.admin,
    teacher: prisma.teacher,
    student: prisma.student,
    parent: prisma.parent,
  };

  const data = await modelMap[type].count();

  const cardGradients: Record<typeof type, string> = {
    admin: "bg-gradient-to-r from-[#EC4899] via-[#F472B6] to-[#DB2777]",
    teacher: "bg-gradient-to-r from-[#0EA5E9] via-[#38BDF8] to-[#0284C7]",
    student: "bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#059669]",
    parent: "bg-gradient-to-r from-[#EC4899] via-[#F472B6] to-[#DB2777]",
  };

  const glowColors: Record<typeof type, string> = {
    admin: "shadow-[0_0_20px_rgba(236,72,153,0.5)]",
    teacher: "shadow-[0_0_20px_rgba(14,165,233,0.5)]",
    student: "shadow-[0_0_20px_rgba(16,185,129,0.5)]",
    parent: "shadow-[0_0_20px_rgba(236,72,153,0.5)]",
  };

  const iconMap: Record<typeof type, string> = {
    admin: "/admin.png",
    teacher: "/teacher.png",
    student: "/student.png",
    parent: "/parent.png",
  };

  return (
    <div 
      className={`
        relative rounded-2xl ${cardGradients[type]} ${glowColors[type]} p-6 
        flex-1 min-w-[180px] backdrop-blur-sm
        hover:scale-105 hover:-translate-y-1
        transition-all duration-300 ease-out
        before:absolute before:inset-0 
        before:rounded-2xl before:bg-gradient-to-b
        before:from-white/10 before:to-transparent
        before:opacity-50 before:z-0
      `}
    >
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-white font-semibold border border-white/20">
          Totale
          </span>
          <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors">
            <Image 
              src={iconMap[type]} 
              alt={type} 
              width={20} 
              height={20} 
              className="opacity-90"
            />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold my-4 text-white tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text">
          {data}
        </h1>
        
        <div className="flex items-center gap-2 mt-auto">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"/>
          <h2 className="capitalize text-sm font-medium text-white/90">
            {type}s
          </h2>
        </div>
      </div>
    </div>
  );
};

export default UserCard;



