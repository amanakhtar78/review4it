import type { Actor } from "@/types";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ActorAvatarProps {
  actor: Actor;
}

export default function ActorAvatar({ actor }: ActorAvatarProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center space-y-2 w-24 text-center p-2 bg-card",
        "custom-card-shadow" // Apply card-like shadow to the whole container
      )}
    >
      <Avatar
        className={cn(
          "h-20 w-20 border-2 ",
          "rounded-none" // Make avatar square
          // Removed shadow-md as parent div now has custom-card-shadow
        )}
      >
        <AvatarImage
          src={actor.imageUrl}
          alt={actor.name}
          data-ai-hint="actor portrait"
        />
        <AvatarFallback>
          {actor.name.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <p
        className="text-xs font-medium text-foreground truncate w-full"
        title={actor.name}
      >
        {actor.name}
      </p>
      {actor.characterName && (
        <p
          className="text-xs text-muted-foreground truncate w-full"
          title={actor.characterName}
        >
          {actor.characterName}
        </p>
      )}
      {typeof actor.earnings === "number" && (
        <p
          className="text-[10px] text-muted-foreground truncate w-full"
          title={`Earnings: ${actor.earnings}`}
        >
          ₹{actor.earnings}
        </p>
      )}
    </div>
  );
}
