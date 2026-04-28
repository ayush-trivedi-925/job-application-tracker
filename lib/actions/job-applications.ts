"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "../auth/auth";
import { prisma } from "../prisma";

interface JobApplicationData {
  company: string;
  position: string;
  columnId: string;
  boardId: string;
  location?: string;
  notes?: string;
  salary?: string;
  jobUrl?: string;
  tags?: string[];
  description?: string;
}

export async function createJobApplication(data: JobApplicationData) {
  const session = await getSession();

  if (!session?.user) {
    return {
      error: "Unauthorized",
    };
  }

  const {
    columnId,
    boardId,
    company,
    position,
    location,
    notes,
    salary,
    jobUrl,
    tags,
    description,
  } = data;

  if (!columnId || !boardId || !company || !position) {
    return { error: "Missing required fields." };
  }

  //verify board ownership

  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      userId: session.user.id,
    },
  });

  if (!board) {
    return { error: "Board not found" };
  }

  //verifu column belongs to board
  const column = await prisma.column.findFirst({
    where: {
      boardId: boardId,
      id: columnId,
    },
  });

  if (!column) {
    return { error: "Column not found" };
  }

  try {
    const maxOrderApp = await prisma.jobApplication.findFirst({
      where: { columnId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const jobApplication = await prisma.jobApplication.create({
      data: {
        company,
        position,
        location,
        notes,
        salary,
        jobUrl,
        columnId,
        boardId,
        userId: session.user.id,
        tags: tags || [],
        description,
        status: "applied",
        order: maxOrderApp ? maxOrderApp.order + 1 : 0,
      },
    });

    revalidatePath("/dashboard");
    return { data: jobApplication };
  } catch (error) {
    console.error("Failed to create job application:", error);
    return { error: "Failed to create job application" };
  }
}
