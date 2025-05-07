"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-hot-toast";
import Image from "next/image";

type SubjectResult = {
  subject: string;
  examScore: number;
  assignmentScore: number;
  average: number;
};

const StudentResultsPage = () => {
  const { user, isLoaded } = useUser();
  const [results, setResults] = useState<SubjectResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalAverage, setGlobalAverage] = useState(0);
  const [status, setStatus] = useState<"ADMIS" | "REFUSÉ" | "NON ÉVALUÉ">("NON ÉVALUÉ");

  useEffect(() => {
    const fetchResults = async () => {
      if (!isLoaded || !user) return;
      
      try {
        setIsLoading(true);
        const res = await fetch(`/api/results?studentId=${user.id}`);
        
        if (!res.ok) {
          throw new Error("Failed to fetch results");
        }
        
        const data = await res.json();
        console.log("Raw results data:", data);
        
        // Process the results to group by subject
        const subjectMap = new Map<string, SubjectResult>();

        // First pass: initialize all subjects
        data.forEach((result: any) => {
          let subjectName = "Unknown Subject";
          
          if (result.exam?.subject?.name) {
            subjectName = result.exam.subject.name;
          } else if (result.assignment?.lesson?.subject?.name) {
            subjectName = result.assignment.lesson.subject.name;
          }
          
          if (!subjectMap.has(subjectName)) {
            subjectMap.set(subjectName, {
              subject: subjectName,
              examScore: 0,
              assignmentScore: 0,
              average: 0
            });
          }
        });

        // Second pass: fill in scores
        data.forEach((result: any) => {
          let subjectName = "Unknown Subject";
          
          if (result.exam?.subject?.name) {
            subjectName = result.exam.subject.name;
          } else if (result.assignment?.lesson?.subject?.name) {
            subjectName = result.assignment.lesson.subject.name;
          }
          
          const subjectResult = subjectMap.get(subjectName)!;
          
          if (result.examId) {
            subjectResult.examScore = result.score;
          } else if (result.assignmentId) {
            subjectResult.assignmentScore = result.score;
          }
          
          subjectMap.set(subjectName, subjectResult);
        });

        // Third pass: calculate averages
        subjectMap.forEach((result, subject) => {
          result.average = Number(
            (result.examScore * 0.8 + result.assignmentScore * 0.2).toFixed(2)
          );
        });

        const processedResults = Array.from(subjectMap.values());
        setResults(processedResults);
        
        // Calculate global average
        if (processedResults.length > 0) {
          const sum = processedResults.reduce((acc, curr) => acc + curr.average, 0);
          const avg = Number((sum / processedResults.length).toFixed(2));
          setGlobalAverage(avg);
          
          // Set status based on global average
          if (avg >= 10) {
            setStatus("ADMIS");
          } else if (avg > 0) {
            setStatus("REFUSÉ");
          } else {
            setStatus("NON ÉVALUÉ");
          }
        }
      } catch (error) {
        console.error("Error fetching results:", error);
        toast.error("Erreur lors du chargement des résultats");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResults();
  }, [user, isLoaded]);

  if (!isLoaded) {
    return <div className="p-4">Loading user information...</div>;
  }

  if (!user) {
    return <div className="p-4">You must be logged in to view this page.</div>;
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-md p-6 shadow-sm">
        <h1 className="text-2xl font-bold mb-6">Mes Résultats</h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lamaPurple"></div>
          </div>
        ) : (
          <>
            {/* Global Average Card */}
            <div className={`mb-8 p-6 rounded-lg ${
              status === "ADMIS" ? "bg-green-50 border-l-4 border-green-500" : 
              status === "REFUSÉ" ? "bg-red-50 border-l-4 border-red-500" : 
              "bg-gray-50 border-l-4 border-gray-500"
            }`}>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">Moyenne Générale</h2>
                  <p className="text-3xl font-bold mt-2">{globalAverage}/20</p>
                </div>
                <div className={`text-xl font-bold px-4 py-2 rounded-md ${
                  status === "ADMIS" ? "bg-green-200 text-green-800" : 
                  status === "REFUSÉ" ? "bg-red-200 text-red-800" : 
                  "bg-gray-200 text-gray-800"
                }`}>
                  {status}
                </div>
              </div>
            </div>
            
            {/* Subject Results Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">Matière</th>
                    <th className="py-3 px-6 text-center">Note Examen (80%)</th>
                    <th className="py-3 px-6 text-center">Note Devoir (20%)</th>
                    <th className="py-3 px-6 text-center">Moyenne</th>
                    <th className="py-3 px-6 text-center">Statut</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 px-6 text-center">
                        Aucun résultat disponible
                      </td>
                    </tr>
                  ) : (
                    results.map((result, index) => (
                      <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-6 text-left font-medium">
                          {result.subject}
                        </td>
                        <td className="py-3 px-6 text-center">
                          {result.examScore}/20
                        </td>
                        <td className="py-3 px-6 text-center">
                          {result.assignmentScore}/20
                        </td>
                        <td className="py-3 px-6 text-center font-semibold">
                          {result.average}/20
                        </td>
                        <td className="py-3 px-6 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            result.average >= 10 ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                          }`}>
                            {result.average >= 10 ? "ADMIS" : "REFUSÉ"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Grade Distribution Chart */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Répartition des Notes</h2>
              <div className="h-8 w-full bg-gray-200 rounded-full overflow-hidden">
                {results.length > 0 && (
                  <>
                    <div 
                      className="h-full bg-green-500 float-left" 
                      style={{ width: `${(results.filter(r => r.average >= 10).length / results.length) * 100}%` }}
                    ></div>
                    <div 
                      className="h-full bg-red-500 float-left" 
                      style={{ width: `${(results.filter(r => r.average < 10).length / results.length) * 100}%` }}
                    ></div>
                  </>
                )}
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span>Matières réussies</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span>Matières échouées</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentResultsPage;
