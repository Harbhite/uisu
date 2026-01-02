import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const NewsletterSection = () => {
  return (
    <section className="bg-slate-50 px-4 pb-4 block lg:hidden">
      <div className="bg-nobel-cream text-ui-blue rounded-[2.5rem] p-8 shadow-lg border border-ui-blue/10">
        <div className="space-y-6">
          <div>
            <h3 className="font-serif text-3xl leading-tight mb-4 text-ui-blue">
              Subscribe and get the <span className="italic text-nobel-gold">latest history</span> delivered.
            </h3>
            <p className="text-ui-blue/70 text-sm">
              Get foundational documents, historical updates, and union news directly to your inbox.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Input
              type="email"
              placeholder="Email Address"
              className="rounded-full bg-white border-ui-blue/10 text-ui-blue placeholder:text-ui-blue/40 h-12 px-6 focus-visible:ring-ui-blue w-full"
            />
            <Button className="rounded-full h-12 px-8 bg-ui-blue hover:bg-ui-blue/90 text-white font-bold tracking-wide transition-colors w-full">
              Submit
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
