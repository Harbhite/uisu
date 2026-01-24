import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export const AboutUs = () => {
  const headingText = "The Father of Intellectual Unionism.";
  const bodyText = "From the anti-colonial struggles to the fight for democracy, Uites have always stood on the side of the people. This archive serves to document that rich history, structure, and culture.";
  
  const [displayedHeading, setDisplayedHeading] = useState("");
  const [displayedBody, setDisplayedBody] = useState("");
  const [headingComplete, setHeadingComplete] = useState(false);
  const [bodyComplete, setBodyComplete] = useState(false);
  const [startTyping, setStartTyping] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !startTyping) {
          setStartTyping(true);
        }
      },
      { threshold: 0.3 }
    );

    const section = document.getElementById("about-us-section");
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, [startTyping]);

  useEffect(() => {
    if (!startTyping) return;

    let headingIndex = 0;
    const headingInterval = setInterval(() => {
      if (headingIndex < headingText.length) {
        setDisplayedHeading(headingText.slice(0, headingIndex + 1));
        headingIndex++;
      } else {
        clearInterval(headingInterval);
        setHeadingComplete(true);
      }
    }, 40);

    return () => clearInterval(headingInterval);
  }, [startTyping]);

  useEffect(() => {
    if (!headingComplete) return;

    let bodyIndex = 0;
    const bodyInterval = setInterval(() => {
      if (bodyIndex < bodyText.length) {
        setDisplayedBody(bodyText.slice(0, bodyIndex + 1));
        bodyIndex++;
      } else {
        clearInterval(bodyInterval);
        setBodyComplete(true);
      }
    }, 20);

    return () => clearInterval(bodyInterval);
  }, [headingComplete]);

  return (
    <section id="about-us-section" className="py-24 bg-background relative overflow-hidden">
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

          {/* Heading with Typewriter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-serif leading-[1.1]">
              <span className="text-ui-blue">
                {displayedHeading.split(" ").slice(0, 3).join(" ")}
                {displayedHeading.length > "The Father of".length ? "" : ""}
              </span>
              {displayedHeading.length > "The Father of ".length && (
                <>
                  <br />
                  <span className="text-nobel-gold italic">
                    {displayedHeading.split(" ").slice(3).join(" ")}
                  </span>
                </>
              )}
              {!headingComplete && (
                <span className="inline-block w-[3px] h-[0.9em] bg-nobel-gold ml-1 animate-pulse" />
              )}
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
              className="min-h-[4rem]"
            >
              {displayedBody}
              {headingComplete && !bodyComplete && (
                <span className="inline-block w-[2px] h-[1em] bg-muted-foreground ml-0.5 animate-pulse" />
              )}
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
};
