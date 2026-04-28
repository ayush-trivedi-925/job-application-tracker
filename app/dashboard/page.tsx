import KanbanBoard from "@/components/kanban-board";
import { getSession } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const boardData = await prisma.board.findFirst({
    where: {
      userId: session?.user.id,
      name: "Job Hunt",
    },
    include: {
      columns: {
        include: {
          jobApplications: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-black">{boardData?.name}</h1>
          <p className="text-gray-600">Track your job applications</p>
        </div>
        <KanbanBoard board={boardData} userId={session.user.id} />
      </div>
    </div>
  );
}
