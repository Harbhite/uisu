import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const NewsletterSection = () => {
  return (
    <section className="bg-ui-blue text-white py-12 block lg:hidden">
      <div className="container mx-auto px-6">
        <div className="space-y-6">
          <div>
            <h3 className="font-serif text-3xl leading-tight mb-4 text-white">
              Subscribe and get the <span className="italic text-nobel-gold">latest history</span> delivered.
            </h3>
            <p className="text-slate-300 text-sm">
              Get foundational documents, historical updates, and union news directly to your inbox.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Input
              type="email"
              placeholder="Email Address"
              className="rounded-full bg-white/10 border-white/10 text-white placeholder:text-slate-400 h-12 px-6 focus-visible:ring-nobel-gold w-full"
            />
            <Button className="rounded-full h-12 px-8 bg-nobel-gold hover:bg-white hover:text-ui-blue text-ui-blue font-bold tracking-wide transition-colors w-full">
              Submit
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
