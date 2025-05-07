import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import prisma from "@/lib/prisma";
import TableSearch from "@/components/TableSearch";
import FormContainer from "@/components/FormContainer";

export type SalleList = {
  id: number;
  name: string;
  floor: number;
};

const SallesPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const q = searchParams?.q || "";
  const salles = await prisma.salle.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { floor: q ? parseInt(q) || undefined : undefined },
      ],
    },
  });

  const renderRow = (item: SalleList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
    >
      <td className="flex items-center gap-4 p-4">{item.name}</td>
      <td className="hidden md:table-cell">{item.floor}</td>
      <td>
        <div className="flex items-center gap-2">
          {role === "admin" && (
            <>
              <FormContainer table="salle" type="update" data={item} />
              <FormContainer table="salle" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Toutes les salles</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && <FormContainer table="salle" type="create" />}
          </div>
        </div>
      </div>
      {/* TABLE */}
      <table className="w-full mt-4">
        <thead>
          <tr className="text-left text-gray-500 text-sm">
            <th className="p-4">Nom</th>
            <th className="hidden md:table-cell">Étage</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{salles.map(renderRow)}</tbody>
      </table>
    </div>
  );
};

export default SallesPage;