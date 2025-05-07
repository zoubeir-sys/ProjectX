"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@clerk/nextjs";

interface Class {
  id: string;
  name: string;
}

interface Student {
  id: string;
  name: string;
  surname: string;
}

interface Grade {
  subject: string;
  examValue: number;
  assignmentValue: number;
}

interface Teacher {
  id: string;
  subjects: { id: number; name: string }[];
}

const ResultPage = () => {
  const { userId, getToken } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [grades, setGrades] = useState<Grade[]>([{ subject: "", examValue: 0, assignmentValue: 0 }]);
  const [isLoading, setIsLoading] = useState(false);
  const [teacherInfo, setTeacherInfo] = useState<Teacher | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Fetch user role and teacher info if applicable
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = await getToken();
        console.log("Auth token obtained:", !!token); // Log if token exists
        
        const res = await fetch("/api/user/info", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) {
          console.error("User info response not OK:", res.status, res.statusText);
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("User info data:", data); // Log the response data
        setUserRole(data.role);
        
        if (data.role === "teacher") {
          const teacherRes = await fetch(`/api/teachers/${userId}`);
          if (!teacherRes.ok) {
            throw new Error(`Teacher info HTTP error! Status: ${teacherRes.status}`);
          }
          const teacherData = await teacherRes.json();
          setTeacherInfo(teacherData);
          
          // If teacher has only one subject, pre-populate the grades
          if (teacherData.subjects.length === 1) {
            setGrades([{ 
              subject: teacherData.subjects[0].name, 
              examValue: 0, 
              assignmentValue: 0 
            }]);
          }
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        toast.error("Log Out");
      }
    };
    
    fetchUserInfo();
  }, [userId, getToken]);

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // For teachers, only fetch classes they teach
        const url = userRole === "teacher" 
          ? `/api/classes?teacherId=${userId}` 
          : "/api/classes";
          
        const res = await fetch(url);
        const data = await res.json();
        setClasses(data);
      } catch {
        toast.error("Erreur lors du chargement des classes");
      }
    };
    
    if (userRole) {
      fetchClasses();
    }
  }, [userRole, userId]);

  // Fetch students when class is selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) return;
      setIsLoading(true);
      try {
        const res = await fetch(`/api/students?classId=${selectedClass}`);
        const data = await res.json();
        setStudents(data);
      } catch {
        toast.error("Erreur lors du chargement des étudiants");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, [selectedClass]);

  const handleGradeChange = (index: number, field: keyof Grade, value: string | number) => {
    setGrades((prev) =>
      prev.map((g, i) => (i === index ? { 
        ...g, 
        [field]: field === "subject" ? value : Number(value) 
      } : g))
    );
  };

  const addGradeField = () => {
    // If teacher, pre-fill with their subject
    if (userRole === "teacher" && teacherInfo?.subjects.length === 1) {
      setGrades([...grades, { 
        subject: teacherInfo.subjects[0].name, 
        examValue: 0, 
        assignmentValue: 0 
      }]);
    } else {
      setGrades([...grades, { subject: "", examValue: 0, assignmentValue: 0 }]);
    }
  };

  const calculateSubjectAverage = (grade: Grade) => {
    return (grade.examValue * 0.8 + grade.assignmentValue * 0.2).toFixed(2);
  };

  const calculateAverage = () => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, curr) => acc + parseFloat(calculateSubjectAverage(curr)), 0);
    return (sum / grades.length).toFixed(2);
  };

  const handleSubmit = async () => {
    // Prevent multiple submissions
    if (isLoading) return;
    
    console.log("Submit button clicked");
    
    if (!selectedClass || !selectedStudent) {
      toast.error("Veuillez sélectionner une classe et un étudiant.");
      return;
    }
    
    if (grades.some((g) => !g.subject || isNaN(g.examValue) || isNaN(g.assignmentValue))) {
      toast.error("Veuillez remplir tous les champs correctement.");
      return;
    }

    try {
      setIsLoading(true);
      // Log more details for debugging
      console.log("Submitting data:", {
        classId: selectedClass,
        studentId: selectedStudent,
        grades: grades.map(g => ({...g, subject: g.subject.trim()})), // Trim subject names
        average: Number(calculateAverage()),
      });
      
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClass,
          studentId: selectedStudent,
          grades: grades.map(g => ({...g, subject: g.subject.trim()})), // Trim subject names
          average: Number(calculateAverage()),
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        console.error("Server error:", data);
        throw new Error(data.error || "Unknown server error");
      }
      
      console.log("Success response:", data);
      toast.success("Résultats enregistrés !");
      
      // Clear form or reset state after successful submission
      setGrades([{ subject: "", examValue: 0, assignmentValue: 0 }]);
      setSelectedStudent("");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(`Erreur lors de l'enregistrement: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-md m-4">
      <h1 className="text-xl font-semibold mb-4">Saisie des Résultats</h1>

      {/* Selection */}
      <div className="flex gap-4 mb-6">
        <div className="flex flex-col">
          <label className="text-sm text-gray-500">Classe</label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedStudent("");
            }}
            className="p-2 border rounded-md"
          >
            <option value="">Sélectionner une classe</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm text-gray-500">Étudiant</label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="p-2 border rounded-md"
            disabled={isLoading}
          >
            <option value="">Sélectionner un étudiant</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.name} {student.surname}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grades Input */}
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4 mb-2 font-medium">
          <div>Matière</div>
          <div>Examen (80%)</div>
          <div>TP (20%)</div>
          <div>Moyenne</div>
        </div>
        {grades.map((grade, index) => (
          <div key={index} className="grid grid-cols-4 gap-4 items-center">
            {userRole === "teacher" && teacherInfo?.subjects.length === 1 ? (
              <div className="p-2 border rounded-md bg-gray-100">
                {teacherInfo.subjects[0].name}
              </div>
            ) : (
              <input
                type="text"
                placeholder="Matière"
                value={grade.subject}
                onChange={(e) => handleGradeChange(index, "subject", e.target.value)}
                className="p-2 border rounded-md"
              />
            )}
            <input
              type="number"
              placeholder="Note examen"
              value={grade.examValue}
              onChange={(e) => handleGradeChange(index, "examValue", e.target.value)}
              className="p-2 border rounded-md"
            />
            <input
              type="number"
              placeholder="Note devoir"
              value={grade.assignmentValue}
              onChange={(e) => handleGradeChange(index, "assignmentValue", e.target.value)}
              className="p-2 border rounded-md"
            />
            <div className="font-medium text-blue-600">
              {calculateSubjectAverage(grade)}
            </div>
          </div>
        ))}
        {/* Only show add button for admin or teachers with multiple subjects */}
        {(userRole === "admin" || (userRole === "teacher" && teacherInfo?.subjects.length !== 1)) && (
          <button onClick={addGradeField} className="text-blue-500 text-sm hover:underline">
            + Ajouter une matière
          </button>
        )}
      </div>

      {/* Average + Submit */}
      <div className="mt-6 flex justify-between items-center">
        <p className="font-medium text-lg">
          Moyenne Générale : <span className="text-blue-600">{calculateAverage()}</span>
        </p>
        <button
          onClick={handleSubmit}
          disabled={isLoading || !selectedClass || !selectedStudent}
          className={`px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 
            ${(isLoading || !selectedClass || !selectedStudent) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
};

export default ResultPage;




