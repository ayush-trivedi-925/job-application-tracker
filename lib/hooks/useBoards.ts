"use client";

import { Board, Column, Prisma } from "@/lib/generated/prisma/browser";
import { useState } from "react";

type BoardWithColumns = Prisma.BoardGetPayload<{
  include: {
    columns: {
      include: { jobApplications: true };
    };
  };
}>;

export function useBoard(initialBoard?: BoardWithColumns | null) {
  const [board, setBoard] = useState<BoardWithColumns | null>(
    initialBoard || null,
  );
  const [columns, setColumns] = useState(initialBoard?.columns || null);
  const [error, setError] = useState<string | null>(null);

  async function moveJob(
    jobApplicationId: string,
    newColumnId: string,
    newOrder: number,
  ) {}

  return { board, columns, error, moveJob };
}
