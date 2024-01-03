import { signIn, useSession } from "next-auth/react";

import { api } from "@/utils/api";
import { useRouter } from "next/router";
import { ArrowBigRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanningForm } from "@/components/PlanningForm";
import { toast } from "react-toastify";
import { useState } from "react";
import { type GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/server/auth";
import { type SessionType } from "@/types/user-type";

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const session: SessionType | null = await getServerSession(
    context.req,
    context.res,
    authOptions,
  );
  return {
    props: {
      user: session,
    },
  };
};

interface PageProps {
  user: SessionType | null;
}

export default function Home({ user }: PageProps) {
  const router = useRouter();

  const { mutateAsync } = api.room.create.useMutation({
    async onSuccess(data) {
      await router.push(`/room/${data?.id}`);
    },
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const description = event.currentTarget.elements.namedItem(
      "planning-form",
    ) as HTMLInputElement | null;

    const title = event.currentTarget.elements.namedItem(
      "planning-title",
    ) as HTMLInputElement | null;

    const link = event.currentTarget.elements.namedItem(
      "planning-link",
    ) as HTMLInputElement | null;
    if (!description?.value || !description.value) {
      toast.error("Digite o nome da issue");
      return;
    }

    if (!title?.value || !title.value) {
      toast.error("Digite o título da issue");
      return;
    }

    if (!link?.value || !link.value) {
      toast.error("Digite o link da issue");
      return;
    }
    setIsLoading(true);

    try {
      await mutateAsync({
        description: description.value,
        title: title.value,
        link: link.value,
      });
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <main className="flex h-full flex-col items-center  justify-center bg-gradient-to-b  ">
        {!user?.user && (
          <Button
            onClick={() => signIn("discord")}
            className="w-60"
            variant="default"
          >
            Login
          </Button>
        )}

        {user?.user && (
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          <PlanningForm loading={isLoading} onSubmit={handleCreateRoom} />
        )}
      </main>
    </>
  );
}
