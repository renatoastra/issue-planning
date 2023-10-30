import { signIn, useSession } from "next-auth/react";
import Head from "next/head";

import { api } from "@/utils/api";
import { useRouter } from "next/router";
import { ArrowBigRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanningForm } from "@/components/PlanningForm";
import { toast } from "react-toastify";
import { useState } from "react";

export default function Home() {
  const { data } = useSession();
  const router = useRouter();

  const { mutateAsync } = api.room.create.useMutation({
    async onSuccess(data, variables, context) {
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
      <Head>
        <title>ISSUE PLANNING</title>
        <meta name="description" content="Vote no peso da sua issue" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-full flex-col items-center  justify-center bg-gradient-to-b  ">
        {!data && (
          <Button
            onClick={() => signIn("discord")}
            className="w-60"
            variant="default"
          >
            Login
          </Button>
        )}

        {data && (
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          <PlanningForm loading={isLoading} onSubmit={handleCreateRoom}>
            <Button className="w-60" variant="default">
              Create room
              <ArrowBigRight size={25} />
            </Button>
          </PlanningForm>
        )}
      </main>
    </>
  );
}
