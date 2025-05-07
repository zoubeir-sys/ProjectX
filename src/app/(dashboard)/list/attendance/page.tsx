"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "react-toastify";

interface Student {
  id: string;
  name: string;
  surname: string;
  img?: string;
}

interface AttendanceRecord {
  studentId: string;
  present: boolean;
  note?: string;
}

interface Class {
  id: string;
  name: string;
}

interface Lesson {
  id: number; // Changed from string to number to match the database schema
  name: string;
  classId: number; // Changed from string to number
}

const AttendancePage = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [classes, setClasses] = useState<Class[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch classes when component mounts
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch('/api/classes');
        const data = await response.json();
        setClasses(data);
      } catch (error) {
        toast.error("Failed to load classes");
      }
    };
    fetchClasses();
  }, []);

  // Fetch students when class is selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/students?classId=${selectedClass}`);
        const data = await response.json();
        setStudents(data);
        // Reset attendance records when class changes
        setAttendanceRecords([]);
      } catch (error) {
        toast.error("Failed to load students");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, [selectedClass]);

  // Fetch lessons when class is selected
  useEffect(() => {
    const fetchLessons = async () => {
      if (!selectedClass) return;
      
      try {
        const response = await fetch(`/api/lessons?classId=${selectedClass}`);
        const data = await response.json();
        setLessons(data);
      } catch (error) {
        toast.error("Failed to load lessons");
      }
    };
    fetchLessons();
  }, [selectedClass]);

  const handleAttendanceChange = (studentId: string, present: boolean) => {
    setAttendanceRecords((prev) => {
      const existing = prev.find((record) => record.studentId === studentId);
      if (existing) {
        return prev.map((record) =>
          record.studentId === studentId ? { ...record, present } : record
        );
      }
      return [...prev, { studentId, present }];
    });
  };

  const handleNoteChange = (studentId: string, note: string) => {
    setAttendanceRecords((prev) => {
      const existing = prev.find((record) => record.studentId === studentId);
      if (existing) {
        return prev.map((record) =>
          record.studentId === studentId ? { ...record, note } : record
        );
      }
      return [...prev, { studentId, present: true, note }];
    });
  };

  const handleSubmit = async () => {
    if (!selectedClass || !selectedDate) {
      toast.error("Please select a class and date");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: selectedDate,
          classId: selectedClass,
          lessonId: selectedLesson || null,
          attendances: attendanceRecords,
        }),
      });

      if (!response.ok) throw new Error("Failed to save attendance");
      toast.success("Attendance saved successfully");
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.error("Failed to save attendance");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-md m-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Gestion des présences</h1>
        <div className="flex gap-4">
          <div className="flex flex-col">
            <label className="text-sm text-gray-500">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="p-2 border rounded-md"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-500">Classe</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
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
            <label className="text-sm text-gray-500">Leçon</label>
            <select
              value={selectedLesson}
              onChange={(e) => setSelectedLesson(e.target.value)}
              className="p-2 border rounded-md"
              disabled={!selectedClass}
            >
              <option value="">Sélectionner une leçon</option>
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Étudiant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Présence
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center">
                  {selectedClass ? "No students found" : "Select a class to view students"}
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Image
                        src={student.img || "/noAvatar.png"}
                        alt=""
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {student.name} {student.surname}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-4">
                      <button
                        className={`px-4 py-2 rounded-md ${
                          attendanceRecords.find(
                            (r) => r.studentId === student.id && r.present
                          )
                            ? "bg-green-500 text-white"
                            : "bg-gray-100"
                        }`}
                        onClick={() => handleAttendanceChange(student.id, true)}
                      >
                        Présent
                      </button>
                      <button
                        className={`px-4 py-2 rounded-md ${
                          attendanceRecords.find(
                            (r) => r.studentId === student.id && !r.present
                          )
                            ? "bg-red-500 text-white"
                            : "bg-gray-100"
                        }`}
                        onClick={() => handleAttendanceChange(student.id, false)}
                      >
                        Absent
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      className="p-2 border rounded-md w-full"
                      placeholder="Ajouter une note..."
                      value={attendanceRecords.find((r) => r.studentId === student.id)?.note || ""}
                      onChange={(e) => handleNoteChange(student.id, e.target.value)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Submit Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isLoading || !selectedClass || students.length === 0}
          className={`px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 
            ${(isLoading || !selectedClass || students.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Enregistrement...' : 'Enregistrer les présences'}
        </button>
      </div>
    </div>
  );
};

export default AttendancePage;
