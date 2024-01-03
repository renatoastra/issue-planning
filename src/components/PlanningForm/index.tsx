import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import React from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { RotatingLines } from "react-loader-spinner";
import { ArrowBigRight } from "lucide-react";

interface PlanningFormProps {
  children: React.ReactNode;
  onSubmit: () => void;
  loading?: boolean;
}
export const PlanningForm = ({ onSubmit, loading }: PlanningFormProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-60" variant="default">
          Create room
          <ArrowBigRight size={25} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="my-5 text-3xl">
            O que iremos discutir hoje?
          </DialogTitle>
          <DialogDescription className="w-full ">
            <form onSubmit={onSubmit} className="flex w-full flex-col gap-6">
              <Input
                id="planning-title"
                name="planning-title"
                placeholder="Título"
              />
              <Input
                id="planning-link"
                name="planning-link"
                placeholder="Link"
              />
              <Textarea
                id="planning-form"
                name="planning-form"
                className="h-32 resize-none"
                placeholder="Descrição"
              />
              <Button disabled={loading} type="submit">
                {loading ? (
                  <RotatingLines
                    strokeColor="grey"
                    strokeWidth="5"
                    animationDuration="0.75"
                    width="26"
                    visible={true}
                  />
                ) : (
                  "Criar"
                )}
              </Button>
            </form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
