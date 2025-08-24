import Link from "next/link";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChangeEvent, FormEvent, useState, useEffect } from "react";
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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
      <div className="flex flex-col min-h-[100dvh] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50">
          <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
            <div className={cn(
              "text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent transition-all duration-1000",
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            )}>
              Jordan Cole Hunt
            </div>
            <nav className={cn(
              "hidden md:flex gap-6 transition-all duration-1000 delay-300",
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            )}>
              <Link className="text-slate-300 hover:text-blue-400 transition-colors duration-200 font-medium" href="#about">
                About
              </Link>
              <Link className="text-slate-300 hover:text-blue-400 transition-colors duration-200 font-medium" href="#skills">
                Skills
              </Link>
              <Link className="text-slate-300 hover:text-blue-400 transition-colors duration-200 font-medium" href="#testimonials">
                Testimonials
              </Link>
              <Link className="text-slate-300 hover:text-blue-400 transition-colors duration-200 font-medium" href="#contact">
                Contact
              </Link>
            </nav>
            
            {/* Mobile Navigation */}
            <div className={cn(
              "md:hidden transition-all duration-1000 delay-300",
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            )}>
              <div className="flex flex-col gap-2 text-right">
                <Link className="text-slate-300 hover:text-blue-400 transition-colors duration-200 font-medium text-sm" href="#about">
                  About
                </Link>
                <Link className="text-slate-300 hover:text-blue-400 transition-colors duration-200 font-medium text-sm" href="#skills">
                  Skills
                </Link>
                <Link className="text-slate-300 hover:text-blue-400 transition-colors duration-200 font-medium text-sm" href="#testimonials">
                  Testimonials
                </Link>
                <Link className="text-slate-300 hover:text-blue-400 transition-colors duration-200 font-medium text-sm" href="#contact">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:px-12">
          {/* Hero Section */}
          <section className={cn(
            "mb-20 transition-all duration-1000 delay-500",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}>
            <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16">
              {/* Profile Picture */}
              <div className={cn(
                "relative transition-all duration-1000 delay-700",
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
              )}>
                <div className="relative">
                  {/* Animated border */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-1 bg-slate-950 rounded-full"></div>
                  
                  {/* Profile image */}
                  <div className="relative">
                    <Image
                      src="/Jordan Hunt.JPG"
                      alt="Jordan Cole Hunt"
                      width={280}
                      height={280}
                      className="relative z-10 rounded-full object-cover w-64 h-64 lg:w-80 lg:h-80 border-4 border-slate-800 shadow-2xl"
                      priority
                    />
                    
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              {/* Text Content */}
              <div className="text-center lg:text-left flex-1 max-w-2xl">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-3xl lg:translate-x-0 lg:translate-y-0"></div>
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent relative leading-tight">
                    Hi, I&apos;m Jordan
                  </h1>
                </div>
                
                <p className="text-lg md:text-xl lg:text-2xl text-slate-300 mb-8 leading-relaxed">
                  Full-stack developer passionate about creating exceptional digital experiences through clean code and collaborative innovation.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                  <Link href="#contact" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl text-center">
                    Get In Touch
                  </Link>
                  <Link href="#skills" className="border border-slate-600 hover:border-blue-400 text-slate-300 hover:text-blue-400 px-8 py-3 rounded-full font-semibold transition-all duration-200 hover:bg-slate-800/50 text-center">
                    Explore Skills
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section className={cn(
            "mb-20 transition-all duration-1000 delay-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )} id="about">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">About Me</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-xl">
                  <p className="text-slate-300 leading-relaxed">
                    I am an accomplished developer with a robust portfolio of successful projects that demonstrate my strong capacity for team collaboration and self-motivation. My <span className="text-blue-400 font-semibold">JavaScript/TypeScript</span> is the sharpest skill in my toolbox, whether in browser, Node.js or React Native environments.
                  </p>
                </div>
                
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-xl">
                  <p className="text-slate-300 leading-relaxed">
                    Beyond this, I&apos;ve made contributions to projects across a diverse range of technologies like <span className="text-purple-400 font-semibold">Kotlin, C# and Scala</span>. Currently, I&apos;m diving deep into <span className="text-green-400 font-semibold">Python, Postgres, Cloud and Ops</span>, and exploring some low-code tools.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-xl">
                  <p className="text-slate-300 leading-relaxed">
                    For me, programming is more than just a profession; it&apos;s a fulfilling journey that encompasses <span className="text-blue-400 font-semibold">creativity, collaboration, technical prowess, and adaptability</span>. It offers a platform to connect with users, influence businesses, and make a meaningful impact on people&apos;s lives.
                  </p>
                </div>
                
                <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-xl">
                  <p className="text-slate-300 leading-relaxed">
                    I live in <span className="text-purple-400 font-semibold">Durban, South Africa</span> with my beautiful partner and son. I&apos;m {new Date().getFullYear() - 1991} years old and enjoy board sports, lifting weights and video games.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-600/50 shadow-xl">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4 text-blue-400">Myers-Briggs Type: ENFJ (The Protagonist)</h3>
                <p className="text-slate-300 leading-relaxed italic max-w-4xl mx-auto">
                  An ENFJ exhibits traits of extroversion, intuition, and empathy, reflected in their collaborative and compassionate workplace approach. Dedicated to fostering positive relationships and driven by strong ethics, they harness creativity to realize ambitions, making them influential and inspirational team members.
                </p>
              </div>
            </div>
          </section>
          {/* Skills Section */}
          <section className={cn(
            "mb-20 transition-all duration-1000 delay-900",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )} id="skills">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">My Skills</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="group bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-blue-500/50">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">{`</>`}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-200 group-hover:text-blue-400 transition-colors">
                  Frontend Development
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  High-quality and responsive web application development with modern frameworks and best practices.
                </p>
              </div>
              
              <div className="group bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-purple-500/50">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">⚡</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-200 group-hover:text-purple-400 transition-colors">
                  Backend Development
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Performant and scalable web server/services and database development with robust architecture.
                </p>
              </div>
              
              <div className="group bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-green-500/50">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">📱</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-200 group-hover:text-green-400 transition-colors">
                  Mobile Apps
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Professional development of cross-platform applications for iOS and Android using React Native.
                </p>
              </div>
              
              <div className="group bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-orange-500/50">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">👥</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-200 group-hover:text-orange-400 transition-colors">
                  Leadership & Mentoring
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Leading teams towards success, mentoring developers, and fostering collaborative growth environments.
                </p>
              </div>
              
              <div className="group bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-cyan-500/50">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">🚀</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-200 group-hover:text-cyan-400 transition-colors">
                  Project Management
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Experienced in leading cross-functional teams and delivering complex projects on time and within budget.
                </p>
              </div>
            </div>
          </section>
          {/* Testimonials Section */}
          <section className={cn(
            "mb-20 transition-all duration-1000 delay-1100",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )} id="testimonials">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">What People Say</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <div className="group bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 relative">
                <div className="absolute top-6 right-6 text-blue-400/20 text-6xl font-serif">&ldquo;</div>
                <blockquote className="text-slate-300 leading-relaxed text-lg relative z-10">
                  Jordan is a highly technically skilled and curious person. On top of that he has a great deal of empathy and the ability to assess from perspectives other than his own. He has shown great self awareness in the time that I&apos;ve known him and a constant drive for meaning and purpose. He will challenge the status quo to cultivate the best possible environment for him and those around him. I believe Jordan will excel in any Engineering role especially if he gets to interface with / manage other engineers.
                </blockquote>
                <div className="mt-6 pt-6 border-t border-slate-700/50">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-semibold text-lg">AM</span>
                    </div>
                    <div>
                      <div className="text-slate-200 font-semibold">Andre Mocke</div>
                      <div className="text-slate-400 text-sm">Software Engineer at Kurtosys Systems</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="group bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50 relative">
                <div className="absolute top-6 right-6 text-purple-400/20 text-6xl font-serif">&ldquo;</div>
                <blockquote className="text-slate-300 leading-relaxed text-lg relative z-10">
                  Jordan has a vibrant positive can-do attitude to tackling all tasks and obstacles presented to him and is a great team member with his technical knowhow and his team comradery. It was a great pleasure managing and working with Jordan through various projects.
                </blockquote>
                <div className="mt-6 pt-6 border-t border-slate-700/50">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-semibold text-lg">CN</span>
                    </div>
                    <div>
                      <div className="text-slate-200 font-semibold">Craig Naylor</div>
                      <div className="text-slate-400 text-sm">Engineering Lead at Global Logistics Internet</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          {/* Contact Section */}
          <section className={cn(
            "mb-20 transition-all duration-1000 delay-1300",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )} id="contact">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">Get in Touch</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
              <p className="text-slate-400 mt-6 max-w-2xl mx-auto">
                Ready to bring your next project to life? Let&apos;s discuss how we can work together to create something amazing.
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 shadow-xl">
                <form className="grid gap-6" onSubmit={formSubmitHandler}>
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="text-slate-300 font-medium">Name</Label>
                    <Input
                      value={formData.name}
                      className={cn(
                        "bg-slate-700/50 border-slate-600 text-slate-50 placeholder:text-slate-400 focus:bg-slate-700 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200",
                        {
                          "!border-red-500 focus:!border-red-500 focus:!ring-red-500/20": formErrors.name,
                        }
                      )}
                      id="name"
                      placeholder="Your name"
                      onChange={handleInputChange}
                    />
                    {formErrors.name && (
                      <p className="text-red-400 text-sm flex items-center gap-2">
                        <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                        Name is required
                      </p>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-slate-300 font-medium">Email</Label>
                    <Input
                      value={formData.email}
                      className={cn(
                        "bg-slate-700/50 border-slate-600 text-slate-50 placeholder:text-slate-400 focus:bg-slate-700 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200",
                        {
                          "!border-red-500 focus:!border-red-500 focus:!ring-red-500/20": formErrors.email,
                        }
                      )}
                      id="email"
                      placeholder="your.email@example.com"
                      type="email"
                      onChange={handleInputChange}
                    />
                    {formErrors.email && (
                      <p className="text-red-400 text-sm flex items-center gap-2">
                        <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                        Email is required
                      </p>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="message" className="text-slate-300 font-medium">Message</Label>
                    <Textarea
                      value={formData.message}
                      className={cn(
                        "bg-slate-700/50 border-slate-600 text-slate-50 placeholder:text-slate-400 focus:bg-slate-700 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 min-h-32 resize-none",
                        {
                          "!border-red-500 focus:!border-red-500 focus:!ring-red-500/20": formErrors.message,
                        }
                      )}
                      id="message"
                      placeholder="Tell me about your project, ideas, or just say hello!"
                      onChange={handleInputChange}
                    />
                    {formErrors.message && (
                      <p className="text-red-400 text-sm flex items-center gap-2">
                        <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                        Message is required
                      </p>
                    )}
                  </div>
                  
                  <Button
                    className={cn(
                      "w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-full transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl",
                      isSubmitting && "opacity-75 cursor-not-allowed"
                    )}
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Sending...
                      </span>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </section>
        </main>
        {/* Footer */}
        <footer className="bg-slate-900/50 backdrop-blur-sm border-t border-slate-800/50 py-12">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center">
              <div className="mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  Jordan Cole Hunt
                </h3>
                <p className="text-slate-400">Full-stack Developer & Tech Enthusiast</p>
              </div>
              
              <div className="flex justify-center gap-6 mb-8">
                <a
                  className="group flex items-center justify-center w-12 h-12 bg-slate-800/50 hover:bg-gradient-to-br hover:from-blue-500 hover:to-blue-600 rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
                  href="https://www.github.com/jb9k62"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GithubIcon className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
                  <span className="sr-only">GitHub (jb9k62)</span>
                </a>
                <a
                  className="group flex items-center justify-center w-12 h-12 bg-slate-800/50 hover:bg-gradient-to-br hover:from-purple-500 hover:to-purple-600 rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
                  href="https://www.github.com/jordanch"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GithubIcon className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
                  <span className="sr-only">GitHub (jordanch)</span>
                </a>
                <a
                  className="group flex items-center justify-center w-12 h-12 bg-slate-800/50 hover:bg-gradient-to-br hover:from-blue-600 hover:to-blue-700 rounded-full transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
                  href="https://www.linkedin.com/in/jordancolehunt"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LinkedinIcon className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors" />
                  <span className="sr-only">LinkedIn</span>
                </a>
              </div>
              
              <div className="text-slate-400 text-sm">
                <p className="mb-2">© {new Date().getFullYear()} Jordan Cole Hunt. All rights reserved.</p>
                <p>Built with Next.js, React & Tailwind CSS</p>
              </div>
            </div>
          </div>
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
