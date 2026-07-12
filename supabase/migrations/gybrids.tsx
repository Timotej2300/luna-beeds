"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials, timeAgo } from "@/lib/utils";
import { respondFriendRequestAction } from "@/actions/friends";

export interface FriendRequestItem {
  id: string;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}

export function FriendRequestCard({ request }: { request: FriendRequestItem }) {
  const [isPending, startTransition] = useTransition();

  function handleRespond(accept: boolean) {
    startTransition(async () => {
      const result = await respondFriendRequestAction(request.id, accept);
      if (result.success) {
        toast.success(accept ? "Žiadosť prijatá." : "Žiadosť odmietnutá.");
      } else {
        toast.error(result.message ?? "Akcia zlyhala.");
      }
    });
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-11 w-11">
          {request.sender.avatarUrl && <AvatarImage src={request.sender.avatarUrl} alt={request.sender.firstName} />}
          <AvatarFallback>{getInitials(request.sender.firstName, request.sender.lastName)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold">
            {request.sender.firstName} {request.sender.lastName}
          </p>
          <p className="text-xs text-graphite-500">{timeAgo(request.createdAt)}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="icon" variant="outline" disabled={isPending} onClick={() => handleRespond(true)}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-emerald-400" />}
        </Button>
        <Button size="icon" variant="outline" disabled={isPending} onClick={() => handleRespond(false)}>
          <X className="h-4 w-4 text-red-400" />
        </Button>
      </div>
    </div>
  );
}