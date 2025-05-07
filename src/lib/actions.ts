"use server";


import { revalidatePath } from "next/cache";
import {
  ClassSchema,
  ExamSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
  SalleSchema,
  LessonSchema,
  examSchema,
  AssignmentSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { AnnouncementSchema } from "./formValidationSchemas";


type CurrentState = { success: boolean; error: boolean };

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.create({
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.update({
      where: {
        id: data.id,
      },
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.class.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata:{role:"teacher"}
    });

    await prisma.teacher.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          set: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.teacher.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  console.log(data);
  try {
    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { success: false, error: true };
    }

    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata:{role:"student"}
    });

    await prisma.student.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });
    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.student.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
/*-----------------------------------------exam*/

export async function createExam(prevState: any, formData: any) {
  const parsed = examSchema.safeParse(formData);

  if (!parsed.success) {
    console.error("Validation error:", parsed.error);
    return { success: false, error: true };
  }

  const { classId, subjectId, salleId, startTime, endTime } = parsed.data;

  try {
    await prisma.exam.create({
      data: {
        classId,
        subjectId,
        salleId: salleId || null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    return { success: true, error: false };
  } catch (error) {
    console.error("Erreur création examen :", error);
    return { success: false, error: true };
  }
}

export async function updateExam(prevState: any, formData: any) {
  const parsed = examSchema.safeParse(formData);

  if (!parsed.success || !parsed.data.id) {
    console.error("Validation error:", parsed.error);
    return { success: false, error: true };
  }

  const { id, classId, subjectId, salleId, startTime, endTime } = parsed.data;

  try {
    await prisma.exam.update({
      where: { id: Number(id) },
      data: {
        classId,
        subjectId,
        salleId: salleId || null,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
      },
    });

    return { success: true, error: false };
  } catch (error) {
    console.error("Erreur mise à jour examen :", error);
    return { success: false, error: true };
  }
}

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  console.log("Attempting to delete exam with ID:", id);
  
  try {
    // Verify the exam exists before trying to delete it
    const exam = await prisma.exam.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!exam) {
      console.error(`Exam with ID ${id} not found`);
      return { success: false, error: true, message: "Exam not found" };
    }
    
    await prisma.exam.delete({
      where: {
        id: parseInt(id),
      },
    });
    
    console.log(`Successfully deleted exam with ID: ${id}`);
    return { success: true, error: false };
  } catch (err) {
    console.error("Erreur suppression examen :", err);
    return { success: false, error: true };
  }
};
/*-------------------------------------------------------------------*/
/*-----------------------------------Assignment--------------------------------*/




export async function createAssignment(prevState: any, formData: AssignmentSchema) {
  try {
    await prisma.assignment.create({
      data: {
        title: formData.title,
        description: formData.description,
        lessonId: formData.lessonId,
        dueDate: new Date(formData.dueDate),
        pdfUrl: formData.pdfUrl || null,
        weightPercentage: formData.weightPercentage || 20,
      },
    });

    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (error) {
    console.error("Error creating assignment:", error);
    return { success: false, error: true };
  }
}

export async function updateAssignment(prevState: any, formData: AssignmentSchema) {
  try {
    await prisma.assignment.update({
      where: {
        id: Number(formData.id),
      },
      data: {
        title: formData.title,
        description: formData.description,
        lessonId: formData.lessonId,
        dueDate: new Date(formData.dueDate),
        pdfUrl: formData.pdfUrl || null,
        weightPercentage: formData.weightPercentage || 20,
      },
    });

    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (error) {
    console.error("Error updating assignment:", error);
    return { success: false, error: true };
  }
}

export const deleteAssignment = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  console.log("Attempting to delete assignment with ID:", id);
  
  try {
    await prisma.assignment.delete({
      where: {
        id: parseInt(id),
      },
    });
    
    revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting assignment:", err);
    return { success: false, error: true };
  }
};

export async function getPdfDownloadUrl(pdfUrl: string) {
  try {
    if (!pdfUrl) return '';
    
    // Extract the public_id from the Cloudinary URL
    if (pdfUrl.includes('cloudinary.com') && pdfUrl.includes('/upload/')) {
      // Extract the public_id from the URL
      const regex = /\/upload\/(?:v\d+\/)?(.+)$/;
      const match = pdfUrl.match(regex);
      
      if (match && match[1]) {
        const publicId = match[1];
        // For security reasons, we're not including API keys in client-side code
        // Instead, we'll return a URL that will work for public assets
        return `https://res.cloudinary.com/dmdv2fuhy/image/upload/fl_attachment/${publicId}`;
      }
    }
    
    // If we couldn't parse the URL, return the original
    return pdfUrl;
  } catch (error) {
    console.error("Error processing PDF URL:", error);
    return pdfUrl;
  }
}

/*-------------------------------------------------------------------*/
export async function createEvent(prevState: any, formData: any) {
  try {
    await prisma.event.create({
      data: {
        title: formData.title,
        description: formData.description,
        startTime: formData.startTime,
        endTime: formData.endTime,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.error("Error creating event:", error);
    return { success: false, error: true };
  }
}

export async function updateEvent(prevState: any, formData: any) {
  try {
    await prisma.event.update({
      where: {
        id: parseInt(formData.id),
      },
      data: {
        title: formData.title,
        description: formData.description,
        startTime: formData.startTime,
        endTime: formData.endTime,
      },
    });
    return { success: true, error: false };
  } catch (error) {
    console.error("Error updating event:", error);
    return { success: false, error: true };
  }
}

export const deleteEvent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  console.log("Attempting to delete event with ID:", id);
  
  try {
    const result = await prisma.event.delete({
      where: {
        id: parseInt(id),
      },
    });
    console.log("Delete result:", result);
    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting event:", err);
    return { success: false, error: true };
  }
};

export async function createAnnouncement(prevState: any, formData: AnnouncementSchema) {
  try {
    await prisma.announcement.create({
      data: {
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date),
        classId: formData.classId ? parseInt(formData.classId) : null,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
}

export async function updateAnnouncement(prevState: any, formData: AnnouncementSchema) {
  try {
    await prisma.announcement.update({
      where: { 
        id: parseInt(formData.id!) // Convert string to number and assert id exists
      },
      data: {
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date),
        classId: formData.classId ? parseInt(formData.classId) : null,
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
}
export const deleteAnnouncement = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.announcement.delete({
      where: {
        id: parseInt(id),
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export async function createLesson(prevState: any, formData: LessonSchema) {
  try {
    console.log("Creating lesson with data:", formData);
    await prisma.lesson.create({
      data: {
        name: formData.name,
        startTime: formData.startTime,
        endTime: formData.endTime,
        subjectId: formData.subjectId,
        classId: formData.classId,
        teacherId: formData.teacherId,
        salleId: formData.salleId ? Number(formData.salleId) : null,
      },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
}

export async function updateLesson(prevState: any, formData: LessonSchema) {
  try {
    await prisma.lesson.update({
      where: {
        id: formData.id,
      },
      data: {
        name: formData.name,
        startTime: formData.startTime,
        endTime: formData.endTime,
        subjectId: formData.subjectId,
        classId: formData.classId,
        teacherId: formData.teacherId,
        salleId: formData.salleId || null,
      },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
}

export async function deleteLesson(prevState: any, formData: FormData) {
  try {
    const id = formData.get("id") as string;
    await prisma.lesson.delete({
      where: {
        id: parseInt(id),
      },
    });
    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
}

//------------------------------------------Salle--------------------------
export async function createSalle(prevState: any, formData: SalleSchema) {
  try {
    await prisma.salle.create({
      data: {
        name: formData.name,
        floor: formData.floor,
      },
    });

    revalidatePath("/list/salles");
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
}

export async function updateSalle(prevState: any, formData: SalleSchema) {
  try {
    await prisma.salle.update({
      where: {
        id: Number(formData.id),
      },
      data: {
        name: formData.name,
        floor: formData.floor,
      },
    });

    revalidatePath("/list/salles");
    return { success: true, error: false };
  } catch (error) {
    console.log(error);
    return { success: false, error: true };
  }
}
export async function deleteSalle(prevState: CurrentState, formData: FormData) {
  try {
    const id = formData.get("id");

    await prisma.salle.delete({
      where: {
        id: Number(id),
      },
    });

    revalidatePath("/list/salles");
    return { success: true, error: false };
  } catch (error) {
    console.error("Error deleting salle:", error);
    return { success: false, error: true };
  }
}


