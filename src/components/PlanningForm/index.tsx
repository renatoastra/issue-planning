import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

interface PlanningFormProps {
  children: React.ReactNode;
  onSubmit: () => void;
}
export const PlanningForm = ({ children, onSubmit }: PlanningFormProps) => {
  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="my-5 text-3xl">
            O que iremos discutir hoje?
          </DialogTitle>
          <DialogDescription className="w-full ">
            <form onSubmit={onSubmit} className="flex w-full flex-col gap-6">
              <Textarea
                id="planning-form"
                name="planning-form"
                className="h-32 resize-none"
              />
              <Button type="submit">Criar</Button>
            </form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
