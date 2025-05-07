"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { ExamSchema, examSchema } from "@/lib/formValidationSchemas";
import { createExam, updateExam } from "@/lib/actions";

const ExamForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData: {
    classes: { id: number; name: string }[];
    subjects: { id: number; name: string }[];
    salles: { id: number; name: string }[];
  };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExamSchema>({
    resolver: zodResolver(examSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createExam : updateExam,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((formData) => {
    // Convert string IDs to numbers for proper database handling
    const processedData = {
      ...formData,
      classId: Number(formData.classId),
      subjectId: Number(formData.subjectId),
      salleId: formData.salleId ? Number(formData.salleId) : null,
      startTime: new Date(formData.startTime),
      endTime: new Date(formData.endTime),
    };
    
    formAction(processedData);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Examen ${type === "create" ? "créé" : "mis à jour"} avec succès`);
      setOpen(false);
      router.refresh();
    }
  }, [state.success, setOpen, router, type]);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Créer un examen" : "Modifier un examen"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-[48%]">
          <label className="text-xs text-gray-500">Matière</label>
          <select
            {...register("subjectId")}
            defaultValue={data?.subjectId}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          > <option value="">Sélectionner une matière</option>
            {relatedData.subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subjectId && (
            <p className="text-xs text-red-400">{errors.subjectId.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-[48%]">
          <label className="text-xs text-gray-500">Classe</label>
          <select
            {...register("classId")}
            defaultValue={data?.classId}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full">
              <option value="">Sélectionner une classe</option>
            {relatedData.classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
          {errors.classId && (
            <p className="text-xs text-red-400">{errors.classId.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-[48%]">
          <label className="text-xs text-gray-500">Salle</label>
          <select
            {...register("salleId")}
            defaultValue={data?.salleId ?? ""}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          >
            <option value="">Sélectionner une salle</option>
            {relatedData.salles.map((salle) => (
              <option key={salle.id} value={salle.id}>
                {salle.name}
              </option>
            ))}
          </select>
        </div>

        <InputField
          label="Date de début"
          name="startTime"
          type="datetime-local"
          defaultValue={
            data?.startTime ? new Date(data.startTime).toISOString().slice(0, 16) : ""
          }
          register={register}
          error={errors.startTime}
        />

        <InputField
          label="Date de fin"
          name="endTime"
          type="datetime-local"
          defaultValue={
            data?.endTime ? new Date(data.endTime).toISOString().slice(0, 16) : ""
          }
          register={register}
          error={errors.endTime}
        />

        {type === "update" && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            hidden
          />
        )}
      </div>

      {state.error && (
        <p className="text-red-500">Une erreur est survenue. Veuillez réessayer.</p>
      )}

      <button className="bg-blue-500 text-white p-2 rounded-md">
        {type === "create" ? "Créer" : "Mettre à jour"}
      </button>
    </form>
  );
};

export default ExamForm;

