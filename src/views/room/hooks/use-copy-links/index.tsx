import { toast } from "@/components/ui/use-toast";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard/useCopyToClipboard";
import { PartyPopper } from "lucide-react";
import { type UseCopyLinksProps } from "./types";

export const useCopyLinks = ({ linkUrl }: UseCopyLinksProps) => {
  const [value, copy] = useCopyToClipboard();

  const handleCopyLink = async () => {
    await copy(linkUrl);
    toast({
      title: "Link copiado",
      description: "O link foi copiado para sua área de transferência",
    });
  };

  const handleCopyRoomUrl = async () => {
    await copy(window.location.href);
    toast({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      title: (
        <span className="flex items-center justify-between">
          Link copiado! <PartyPopper />
        </span>
      ),
      description: (
        <span className="">
          O link foi copiado para sua área de transferência
        </span>
      ),
    });
  };
  return {
    handleCopyLink,
    handleCopyRoomUrl,
    value,
  };
};
