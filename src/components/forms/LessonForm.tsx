"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { lessonSchema, LessonSchema } from "@/lib/formValidationSchemas";
import { createLesson, updateLesson } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const LessonForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<LessonSchema>({
    resolver: zodResolver(lessonSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createLesson : updateLesson,
    {
      success: false,
      error: false,
    }
  );

  const selectedSubjectId = watch("subjectId");

  const filteredTeachers = selectedSubjectId
    ? relatedData.teachers?.filter((teacher: { id: string; subjects: { id: number }[] }) =>
        teacher.subjects?.some(subject => subject.id === Number(selectedSubjectId))
      )
    : [];

  const onSubmit = handleSubmit(async (formData) => {
    const processedData = {
      ...formData,
      // If in update mode, ensure the ID is included
      ...(type === "update" && data?.id && { id: data.id }),
      startTime: new Date(formData.startTime),
      endTime: new Date(formData.endTime),
      subjectId: Number(formData.subjectId),
      classId: Number(formData.classId),
      salleId: formData.salleId ? Number(formData.salleId) : null,
    };

    console.log("Submitting data:", processedData);
    
    try {
      await formAction(processedData);
    } catch (error) {
      console.error("Submission error:", error);
    }
  });

  const router = useRouter();
  const { subjects, classes, salles } = relatedData;

  useEffect(() => {
    if (state.success) {
      toast(`Lesson has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Creer une nouvelle leçon" : "Modifier la leçon"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Nom de la leçon"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Sujet</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("subjectId")}
            defaultValue={data?.subjectId}
          >
            <option value="">Selectionner un sujet</option>
            {subjects?.map((subject: { id: number; name: string }) => (
              <option value={subject.id} key={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subjectId?.message && (
            <p className="text-xs text-red-400">{errors.subjectId.message.toString()}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Classe</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId")}
            defaultValue={data?.classId}
          >
            <option value="">Selectionner une classe</option>
            {classes?.map((class_: { id: number; name: string }) => (
              <option value={class_.id} key={class_.id}>
                {class_.name}
              </option>
            ))}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">{errors.classId.message.toString()}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Salle</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("salleId")}
            defaultValue={data?.salleId}
          >
            <option value="">Selectionner une salle</option>
            {salles?.map((salle: { id: number; name: string; floor: number }) => (
              <option value={salle.id} key={salle.id}>
                {salle.name} (etage {salle.floor})
              </option>
            ))}
          </select>
          {errors.salleId?.message && (
            <p className="text-xs text-red-400">{errors.salleId.message.toString()}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Enseignant</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("teacherId")}
            defaultValue={data?.teacherId}
          >
            <option value="">Selectionner un enseignant</option>
            {selectedSubjectId ? (
              filteredTeachers.map((teacher: { id: string; name: string; surname: string }) => (
                <option value={teacher.id} key={teacher.id}>
                  {teacher.name + " " + teacher.surname}
                </option>
              ))
            ) : (
              <option value="" disabled>
                Selectionnez d abord un sujet
              </option>
            )}
          </select>
          {errors.teacherId?.message && (
            <p className="text-xs text-red-400">{errors.teacherId.message.toString()}</p>
          )}
        </div>

        <InputField
          label="Heure de debut"
          name="startTime"
          type="datetime-local"
          defaultValue={data?.startTime ? new Date(data.startTime).toISOString().slice(0, 16) : undefined}
          register={register}
          error={errors?.startTime}
        />

        <InputField
          label="Heure de fin"
          name="endTime"
          type="datetime-local"
          defaultValue={data?.endTime ? new Date(data.endTime).toISOString().slice(0, 16) : undefined}
          register={register}
          error={errors?.endTime}
        />
      </div>

      {type === "update" && data?.id && (
        <input 
          type="hidden" 
          {...register("id")} 
          defaultValue={data.id} 
        />
      )}

      {state.error && (
        <span className="text-red-500">Quelque chose s’est mal passe !</span>
      )}

      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Creer" : "Modifier"}
      </button>
    </form>
  );
};

export default LessonForm;





