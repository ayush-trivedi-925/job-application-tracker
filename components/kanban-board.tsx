"use client";

import { Column, JobApplication, Prisma } from "@/lib/generated/prisma/browser";
import {
  Award,
  Calendar,
  CheckCircle2,
  Mic,
  MoreVertical,
  Trash2,
  XCircle,
} from "lucide-react";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import CreateJobApplicationDialog from "./create-job-application-dialog";
import JobApplicationCard from "./job-application-card";
import { useBoard } from "@/lib/hooks/useBoards";

type Board = Prisma.BoardGetPayload<{
  include: {
    columns: {
      include: {
        jobApplications: true;
      };
    };
  };
}>;

interface KanbanBoardProps {
  board: Board | null;

  userId: string;
}

type BoardColumn = Board["columns"][number];

const COLUMN_CONFIG: Array<{ color: string; icon: React.ReactNode }> = [
  {
    color: "bg-cyan-500",
    icon: <Calendar />,
  },
  {
    color: "bg-purple-500",
    icon: <CheckCircle2 />,
  },
  {
    color: "bg-green-500",
    icon: <Mic />,
  },
  {
    color: "bg-yellow-500",
    icon: <Award />,
  },
  {
    color: "bg-red-500",
    icon: <XCircle />,
  },
];

interface ColConfig {
  color: string;
  icon: React.ReactNode;
}

function DroppableColumn({
  column,
  config,
  boardId,
  sortedColumns,
}: {
  column: BoardColumn;
  config: ColConfig;
  boardId: string;
  sortedColumns: Column[];
}) {
  const sortedJobs =
    column.jobApplications?.sort((a, b) => a.order - b.order) || [];
  return (
    <Card className="min-w-[300px] flex-shrink-0 shadow-md p-0">
      <CardHeader
        className={`${config.color} text-white rounded-t-lg pb-3 pt-3`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {config.icon}
            <CardTitle className="text-white text-base font-semibold">
              {column.name}
            </CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white hover:bg-white/20"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent
        className={`space-y-2 pt-4 bg-gray-50/50 min-h-[400px] rounded-b-lg`}
      >
        {sortedJobs.map((job, key) => (
          <SortableJobCard
            key={key}
            job={{ ...job, columnId: job.columnId || column.id }}
            columns={sortedColumns}
          />
        ))}
        <CreateJobApplicationDialog columnId={column.id} boardId={boardId} />
      </CardContent>
    </Card>
  );
}

function SortableJobCard({
  job,
  columns,
}: {
  job: JobApplication;
  columns: Column[];
}) {
  return (
    <div>
      <JobApplicationCard job={job} columns={columns} />
    </div>
  );
}

function KanbanBoard({ board, userId }: KanbanBoardProps) {
  if (!board) return <div>No board found</div>;

  const { columns, moveJob } = useBoard(board);
  const sortedColumns = columns!.sort((a, b) => a.order - b.order) || [];
  return (
    <div>
      <div>
        {columns!.map((col, key) => {
          const config = COLUMN_CONFIG[key] || {
            color: "bg-cyan-500",
            icon: <Calendar />,
          };
          return (
            <DroppableColumn
              key={key}
              column={col}
              config={config}
              boardId={board.id}
              sortedColumns={sortedColumns}
            />
          );
        })}
      </div>
    </div>
  );
}

export default KanbanBoard;
