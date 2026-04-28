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

export async function updateJobApplication(
  id: string,
  updates: {
    company?: string;
    position?: string;
    location?: string;
    notes?: string;
    salary?: string;
    jobUrl?: string;
    columnId?: string;
    order?: number;
    tags?: string[];
    description?: string;
  },
) {
  const session = await getSession();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const jobApplication = await prisma.jobApplication.findUnique({
    where: { id },
  });

  if (!jobApplication) {
    return { error: "Job application not found" };
  }

  if (jobApplication.userId !== session.user.id) {
    return { error: "Unauthorized" };
  }

  const { columnId, order, ...otherUpdates } = updates;
  const currentColumnId = jobApplication.columnId;
  const newColumnId = columnId;
  const isMovingToDifferentColumn =
    newColumnId && newColumnId !== currentColumnId;

  try {
    if (isMovingToDifferentColumn) {
      // get jobs in target column excluding current job
      const jobsInTargetColumn = await prisma.jobApplication.findMany({
        where: {
          columnId: newColumnId,
          id: { not: id },
        },
        orderBy: { order: "asc" },
      });

      let newOrderValue: number;

      if (order !== undefined && order !== null) {
        newOrderValue = order * 100;

        // shift jobs in target column down
        const jobsThatNeedToShift = jobsInTargetColumn.slice(order);
        await Promise.all(
          jobsThatNeedToShift.map((job) =>
            prisma.jobApplication.update({
              where: { id: job.id },
              data: { order: job.order + 100 },
            }),
          ),
        );
      } else {
        if (jobsInTargetColumn.length > 0) {
          const lastJobOrder =
            jobsInTargetColumn[jobsInTargetColumn.length - 1].order ?? 0;
          newOrderValue = lastJobOrder + 100;
        } else {
          newOrderValue = 0;
        }
      }

      const updated = await prisma.jobApplication.update({
        where: { id },
        data: {
          ...otherUpdates,
          columnId: newColumnId,
          order: newOrderValue,
        },
      });

      revalidatePath("/dashboard");
      return { data: updated };
    } else if (order !== undefined && order !== null) {
      // reordering within same column
      const otherJobsInColumn = await prisma.jobApplication.findMany({
        where: {
          columnId: currentColumnId,
          id: { not: id },
        },
        orderBy: { order: "asc" },
      });

      const currentJobOrder = jobApplication.order ?? 0;
      const currentPositionIndex = otherJobsInColumn.findIndex(
        (job) => job.order > currentJobOrder,
      );
      const oldPositionIndex =
        currentPositionIndex === -1
          ? otherJobsInColumn.length
          : currentPositionIndex;

      const newOrderValue = order * 100;

      if (order < oldPositionIndex) {
        // moving up — shift jobs down
        const jobsToShiftDown = otherJobsInColumn.slice(
          order,
          oldPositionIndex,
        );
        await Promise.all(
          jobsToShiftDown.map((job) =>
            prisma.jobApplication.update({
              where: { id: job.id },
              data: { order: job.order + 100 },
            }),
          ),
        );
      } else if (order > oldPositionIndex) {
        // moving down — shift jobs up
        const jobsToShiftUp = otherJobsInColumn.slice(oldPositionIndex, order);
        await Promise.all(
          jobsToShiftUp.map((job) =>
            prisma.jobApplication.update({
              where: { id: job.id },
              data: { order: Math.max(0, job.order - 100) },
            }),
          ),
        );
      }

      const updated = await prisma.jobApplication.update({
        where: { id },
        data: { ...otherUpdates, order: newOrderValue },
      });

      revalidatePath("/dashboard");
      return { data: updated };
    } else {
      // just updating fields, no reordering
      const updated = await prisma.jobApplication.update({
        where: { id },
        data: otherUpdates,
      });

      revalidatePath("/dashboard");
      return { data: updated };
    }
  } catch (error) {
    console.error("Failed to update job application:", error);
    return { error: "Failed to update job application" };
  }
}

export async function deleteJobApplication(id: string) {
  const session = await getSession();

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const jobApplication = await prisma.jobApplication.findUnique({
    where: {
      id,
    },
  });

  if (!jobApplication) {
    return { error: "Job application not found" };
  }

  if (jobApplication.userId !== session.user.id) {
    return { error: "Unauthorized" };
  }

  await prisma.jobApplication.delete({
    where: {
      id,
    },
  });

  revalidatePath("/dashboard");

  return { success: true };
}
