import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="grid h-screen items-center bg-background pb-8 lg:pb-0">
      <div className="text-center">
        <p className="text-7xl font-bold text-muted-foreground">404</p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl lg:text-7xl">
          Page not found
        </h1>
        <p className="mt-6 text-base leading-7 text-muted-foreground">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-4">
          <Button size="lg">Go back home</Button>
          <Button size="lg" variant="outline">
            Contact support <ArrowRight className="ms-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
