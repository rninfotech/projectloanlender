import { cn } from "@/lib/utils";

function Separator({
  className,
  orientation = "horizontal",
  children,
  ...props
}: React.ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical";
}) {
  if (children) {
    return (
      <div className={cn("relative flex items-center w-full my-4", className)} {...props}>
        <div className="flex-grow border-t border-border" />
        <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground uppercase tracking-wider">
          {children}
        </span>
        <div className="flex-grow border-t border-border" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full my-4" : "h-full w-[1px] mx-4",
        className
      )}
      {...props}
    />
  );
}

export { Separator };
