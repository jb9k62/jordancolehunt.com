import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChangeEvent, FormEvent, useState } from "react";
import { cn } from "@/lib/utils";
import { NextSeo } from "next-seo";

export default function Component() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [formErrors, setFormErrors] = useState({
    name: false,
    email: false,
    message: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const formSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = {
      name: !formData.name,
      email: !formData.email,
      message: !formData.message,
    };
    setFormErrors(errors);

    if (Object.values(errors).some((error) => error)) {
      return;
    }
    setIsSubmitting(true);

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    setIsSubmitting(false);
    const data = await response.json();

    if (response.ok) {
      alert(data.message);
    } else {
      alert(data.error);
    }
  };
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  return (
    <>
      <NextSeo
        title="Jordan Cole Hunt's personal website"
        description="A website about Jordan Cole Hunt, his background, skills, testimonials and contact details"
        // Add more SEO properties as needed
      />
      <div className="flex flex-col min-h-[100dvh] bg-gray-950 text-gray-50">
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="text-2xl font-bold">Jordan Cole Hunt</div>
          <nav className="flex gap-1 md:gap-4 flex-col md:flex-row">
            <Link className="hover:underline" href="#about">
              About
            </Link>
            <Link className="hover:underline" href="#skills">
              Skills
            </Link>
            <Link className="hover:underline" href="#testimonials">
              Testimonials
            </Link>
            <Link className="hover:underline" href="#contact">
              Contact
            </Link>
          </nav>
        </header>
        <main className="flex-1 px-6 py-12 md:px-12 lg:px-24">
          <section className="mb-12" id="about">
            <h2 className="text-3xl font-bold mb-4">About Me</h2>
            <p className="text-gray-300 leading-relaxed">
              I am an accomplished developer with a robust portfolio of
              successful projects that demonstrate my strong capacity for team
              collaboration and self-motivation. My JavaScript/TypeScript is the
              sharpest skill in my toolbox, whether in browser, Node.js or React
              Native environments. Beyond this, I&apos;ve made contributions to
              projects across a diverse range of technologies like Kotlin, C#
              and Scala. Currently, I&apos;m diving deep into Python, Postgres,
              Cloud and Ops, and exploring some low-code tools.
            </p>
            <p className="text-gray-300 leading-relaxed pt-5">
              For me, programming is more than just a profession; it&apos;s a
              fulfilling journey that encompasses creativity, collaboration,
              technical prowess, and adaptability. It offers a platform to
              connect with users, influence businesses, and make a meaningful
              impact on people&apos;s lives. I&apos;m a committed collaborator,
              thriving on exchanging ideas, imparting knowledge, and fostering a
              continuous learning environment.
            </p>
            <p className="text-gray-300 leading-relaxed pt-5">
              I live in Durban, South Africa with my beautiful partner and son.
              I&apos;m {new Date().getFullYear() - 1991} years old and enjoy
              board sports, lifting weights and video games.
            </p>
            <p className="text-gray-300 leading-relaxed pt-5">
              A staunch advocate for life-long learning, I&apos;m dedicated to
              ongoing professional and personal development. Myers-Briggs Type:
              ENFJ.
            </p>
            <p className="text-gray-300 leading-relaxed pt-5 italic">
              An ENFJ, often referred to as a Protagonist, exhibits traits of
              extroversion, intuition, and empathy, which are reflected in their
              approach to the workplace and interactions with colleagues.
              Renowned for their collaborative and compassionate nature, they
              are dedicated to fostering positive relationships and are driven
              by a strong set of ethics and values. Their ability to harness
              creativity to realize their ambitions makes them influential and
              inspirational team members.
            </p>
          </section>
          <section className="mb-12" id="skills">
            <h2 className="text-3xl font-bold mb-4">My Skills</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-2">
                  Frontend development
                </h3>
                <p className="text-gray-300">
                  High-quality and responsive web application development.
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-2">
                  Backend development
                </h3>
                <p className="text-gray-300">
                  Performant and scalable web server/services and database
                  development.
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-2">Mobile apps</h3>
                <p className="text-gray-300">
                  Professional development of applications for iOS and Android
                  using React Native.
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-2">
                  Leadership and mentoring
                </h3>
                <p className="text-gray-300">
                  Leading teams towards success, mentoring and guiding along the
                  way.
                </p>
              </div>
              <div className="bg-gray-800 p-4 rounded-md">
                <h3 className="text-lg font-semibold mb-2">
                  Project Management
                </h3>
                <p className="text-gray-300">
                  Experienced in leading cross-functional teams and delivering
                  projects on time and within budget.
                </p>
              </div>
            </div>
          </section>
          <section className="mb-12" id="testimonials">
            <h2 className="text-3xl font-bold mb-4">What People Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <div className="bg-gray-800 p-4 rounded-md">
                <blockquote className="text-gray-300 italic">
                  &quot;Jordan is a highly technically skilled and curious
                  person. On top of that he has a great deal of empathy and the
                  ability to assess from perspectives other than his own. He has
                  shown great self awareness in the time that I&apos;ve known
                  him and a constant drive for meaning and purpose. He will
                  challenge the status quo to cultivate the best possible
                  environment for him and those around him. I believe Jordan
                  will excel in any Engineering role especially if he gets to
                  interface with / manage other engineers.&quot;
                </blockquote>
                <div className="mt-4 text-gray-400">
                  - Andre Mocke - Software Engineer at Kurtosys Systems.
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded-md">
                <blockquote className="text-gray-300 italic">
                  &quot;Jordan has a vibrant positive can-do attitude to
                  tackling all tasks and obstacles presented to him and is a
                  great team member with his technical knowhow and his team
                  comradery. It was a great pleasure managing and working with
                  Jordan through various projects.&quot;
                </blockquote>
                <div className="mt-4 text-gray-400">
                  - Craig Naylor - Engineering Lead at Global Logistics
                  Internet.
                </div>
              </div>
            </div>
          </section>
          <section className="mb-12" id="contact">
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <div className="bg-gray-800 p-6 rounded-md">
              <form className="grid gap-4" onSubmit={formSubmitHandler}>
                <div className="grid gap-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    value={formData.name}
                    className={cn(
                      "bg-gray-700 text-gray-50 focus:bg-gray-600 focus:text-gray-50",
                      {
                        "!border-red-500": formErrors.name,
                      }
                    )}
                    id="name"
                    placeholder="Your name"
                    onChange={handleInputChange}
                  />
                  {formErrors.name && (
                    <p className="text-red-500">Cannot be empty</p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    value={formData.email}
                    className={cn(
                      "bg-gray-700 text-gray-50 focus:bg-gray-600 focus:text-gray-50",
                      {
                        "!border-red-500": formErrors.name,
                      }
                    )}
                    id="email"
                    placeholder="Your email"
                    type="email"
                    onChange={handleInputChange}
                  />
                  {formErrors.email && (
                    <p className="text-red-500">Cannot be empty</p>
                  )}
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    value={formData.message}
                    className={cn(
                      "bg-gray-700 text-gray-50 focus:bg-gray-600 focus:text-gray-50",
                      {
                        "!border-red-500": formErrors.name,
                      }
                    )}
                    id="message"
                    placeholder="Your message"
                    onChange={handleInputChange}
                  />
                  {formErrors.message && (
                    <p className="text-red-500">Cannot be empty</p>
                  )}
                </div>
                <Button
                  className="w-full"
                  type="submit"
                  disabled={isSubmitting}
                >
                  Send Message
                </Button>
              </form>
            </div>
          </section>
        </main>
        <footer className="bg-gray-800 py-6 text-center text-sm text-gray-400 flex justify-center">
          © {new Date().getFullYear()} Jordan Cole Hunt. All rights reserved.
          <a
            className="text-gray-400 transition-colors hover:text-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 dark:focus:ring-gray-300 dark:focus:ring-offset-gray-800 ml-2"
            href="https://www.github.com/jb9k62"
            target="_blank"
          >
            <GithubIcon className="h-6 w-6" />
            <span className="sr-only">GitHub</span>
          </a>
          <a
            className="text-gray-400 transition-colors hover:text-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 dark:focus:ring-gray-300 dark:focus:ring-offset-gray-800 ml-2"
            href="https://www.github.com/jordanch"
            target="_blank"
          >
            <GithubIcon className="h-6 w-6" />
            <span className="sr-only">GitHub</span>
          </a>
          <a
            className="text-gray-400 transition-colors hover:text-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 dark:focus:ring-gray-300 dark:focus:ring-offset-gray-800 ml-2"
            href="https://www.linkedin.com/in/jordancolehunt"
            target="_blank"
          >
            <LinkedinIcon className="h-6 w-6" />
            <span className="sr-only">LinkedIn</span>
          </a>
        </footer>
      </div>
    </>
  );
}

function LinkedinIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function GithubIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}
