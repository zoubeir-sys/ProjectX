"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { salleSchema, SalleSchema } from "@/lib/formValidationSchemas";
import { createSalle, updateSalle } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const SalleForm = ({
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
    handleSubmit,
    formState: { errors },
  } = useForm<SalleSchema>({
    resolver: zodResolver(salleSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createSalle : updateSalle,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    console.log(data);
    formAction(data);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Salle has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Creer une nouvelle salle" : "Modifier la salle"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Nom de la salle"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
        />
        <InputField
          label="etage"
          name="floor"
          defaultValue={data?.floor}
          register={register}
          error={errors?.floor}
          type="number"
        />
        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
      </div>
      {state.error && (
        <span className="text-red-500">Quelque chose s est mal passe !</span>
      )}
      <button
        type="submit"
        className="bg-blue-400 text-white p-2 rounded-md"
      >
        {type === "create" ? "Creer" : "Mettre à jour"}
      </button>
    </form>
  );
};

export default SalleForm;