import { motion } from "framer-motion";

export const AboutUs = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block bg-muted px-4 py-1.5 rounded-full mb-8"
          >
            <span className="text-xs font-bold tracking-[0.1em] uppercase text-foreground">
              About Us
            </span>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-serif leading-[1.1]">
              <span className="text-ui-blue">The Father of</span>
              <br />
              <span className="text-nobel-gold italic">Intellectual</span>
              <br />
              <span className="text-nobel-gold italic">Unionism.</span>
            </h2>
          </motion.div>

          {/* Subheading */}
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl text-ui-blue font-medium mb-12"
          >
            First and Best.
          </motion.h3>

          {/* Body Text */}
          <div className="space-y-8 text-lg md:text-xl text-muted-foreground font-light leading-relaxed max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              Founded in 1948, the University of Ibadan Students' Union is the
              oldest and most prestigious student body in Nigeria.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              From the anti-colonial struggles to the fight for democracy, Uites
              have always stood on the side of the people. This archive serves to
              document that rich history, structure, and culture.
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
};
