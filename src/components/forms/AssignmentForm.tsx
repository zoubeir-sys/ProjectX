"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { AssignmentSchema, assignmentSchema } from "@/lib/formValidationSchemas";
import { createAssignment, updateAssignment } from "@/lib/actions";
import { CldUploadWidget } from "next-cloudinary";

const AssignmentForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    lessons?: { id: number; name: string; teacher: { id: string; name: string; surname: string }; class: { id: number; name: string }; subject: { id: number; name: string } }[];
  };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignmentSchema>({
    resolver: zodResolver(assignmentSchema),
  });

  const [pdfFile, setPdfFile] = useState<any>();

  const [state, formAction] = useFormState(
    type === "create" ? createAssignment : updateAssignment,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((formData) => {
    console.log("PDF file info:", pdfFile);
    
    // Fix the URL if needed - ensure it's using the correct format
    let pdfUrl = pdfFile?.secure_url || data?.pdfUrl;
    
    // If the URL contains /image/upload/ for a PDF, change it to /raw/upload/
    if (pdfUrl && pdfUrl.includes('/image/upload/') && pdfUrl.endsWith('.pdf')) {
      pdfUrl = pdfUrl.replace('/image/upload/', '/raw/upload/');
    }
    
    const processedData = {
      ...formData,
      lessonId: Number(formData.lessonId),
      dueDate: new Date(formData.dueDate),
      pdfUrl: pdfUrl,
      weightPercentage: 20,
    };
    
    console.log("Processed data with PDF URL:", processedData);
    formAction(processedData);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Travail ${type === "create" ? "créé" : "mis à jour"} avec succès`);
      setOpen(false);
      router.refresh();
    }
  }, [state.success, setOpen, router, type]);

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Créer un travail à faire" : "Modifier le travail"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Titre du travail"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />

        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Description</label>
          <textarea
            {...register("description")}
            defaultValue={data?.description}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full min-h-[100px]"
          />
          {errors.description && (
            <p className="text-xs text-red-400">{errors.description.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-[48%]">
          <label className="text-xs text-gray-500">Leçon</label>
          <select
            {...register("lessonId")}
            defaultValue={data?.lessonId}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          >
            <option value="">Sélectionner une leçon</option>
            {relatedData?.lessons?.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.name} - {lesson.subject.name} ({lesson.class.name}) - Prof: {lesson.teacher.name} {lesson.teacher.surname}
              </option>
            )) || <option disabled>Chargement des leçons...</option>}
          </select>
          {errors.lessonId && (
            <p className="text-xs text-red-400">{errors.lessonId.message}</p>
          )}
        </div>

        <InputField
          label="Date limite"
          name="dueDate"
          type="datetime-local"
          defaultValue={
            data?.dueDate ? new Date(data.dueDate).toISOString().slice(0, 16) : ""
          }
          register={register}
          error={errors.dueDate}
        />

        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Fiche PDF</label>
          <CldUploadWidget
            uploadPreset="Zou PFE"
            options={{
              sources: ['local', 'url'],
              resourceType: 'raw', // Change from 'auto' to 'raw' for PDFs
              folder: 'assignments',
              clientAllowedFormats: ['pdf'],
              maxFileSize: 10000000, // 10MB max file size
              publicId: `assignment-${Date.now()}`, // Generate unique ID
              // Remove the access_mode property as it's not supported in the type
            }}
            onSuccess={(result, { widget }) => {
              console.log("Upload result:", result);
              setPdfFile(result.info);
              widget.close();
            }}
            onError={(error) => {
              console.error("Upload error:", error);
            }}
          >
            {({ open }) => (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => open()}
                  className="bg-gray-200 text-gray-700 p-2 rounded-md w-full md:w-1/3"
                >
                  {pdfFile?.secure_url || data?.pdfUrl ? "Changer le PDF" : "Télécharger un PDF"}
                </button>
                {(pdfFile?.secure_url || data?.pdfUrl) && (
                  <p className="text-xs text-green-500">
                    PDF téléchargé avec succès
                  </p>
                )}
              </div>
            )}
          </CldUploadWidget>
        </div>

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

export default AssignmentForm;









