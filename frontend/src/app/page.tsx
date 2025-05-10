'use client';
import { Button } from "@/components/ui/button";
import { BarChart2, Lightbulb, Users } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 h-16 flex items-center justify-between shadow-md bg-white">
        <div className="flex items-center space-x-2">
          <img src="/Anvesha.png" alt="Anvesha Logo" className="h-10" />
        </div>
        <nav className="flex items-center space-x-6 ml-auto">
          <Link className="text-sm font-medium text-[#6E59A5] hover:underline" href="#about">About</Link>
          <Link className="text-sm font-medium text-[#6E59A5] hover:underline" href="#features">Features</Link>
          <Link href="/dashboard">
            <Button className="bg-[#6E59A5] text-white hover:bg-[#9b87f5] text-sm">Go to Dashboard</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-6 bg-gradient-to-r from-[#E5DEFF] to-[#F1F0FB]">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold tracking-tight text-[#6E59A5] leading-tight">
                Student Dropout Analysis<br />
                with <span className="text-[#9b87f5]">AI-Powered Insights</span>
              </h1>
              <p className="mt-6 text-lg text-gray-700">
                Discover how Anvesha predicts, analyzes, and reduces student dropout rates using intelligent learning systems and data-driven strategies.
              </p>
              <div className="mt-8 flex gap-4">
                <Link href="/dashboard">
                  <Button className="bg-[#9b87f5] hover:bg-[#6E59A5] text-white">
                    Go to Dashboard 
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" className="border-[#9b87f5] text-[#6E59A5] hover:bg-[#E5DEFF]">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1471&q=80" alt="Students" className="rounded-lg shadow-lg" />
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 bg-white px-6">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-[#6E59A5] mb-6">About Anvesha</h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              Anvesha is a cutting-edge AI platform designed to tackle one of the biggest challenges in education: student dropouts. 
              By leveraging real-time data analytics and machine learning algorithms, Anvesha empowers institutions to predict, prevent, 
              and reduce dropout rates effectively. Our mission is to ensure that every student stays on the path to success.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-[#F1F0FB]">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center text-[#6E59A5]">Key Features</h2>
            <p className="mt-4 text-lg text-gray-700 text-center max-w-2xl mx-auto">
              Our AI-driven platform offers powerful tools and insights to help institutions retain more students and build stronger academic communities.
            </p>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white shadow-md rounded-lg p-6 text-center">
                <BarChart2 className="text-[#6E59A5] h-10 w-10 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#6E59A5]">Predictive Analytics</h3>
                <p className="mt-2 text-gray-700">
                  Use real-time predictive models to identify at-risk students before they disengage.
                </p>
              </div>

              <div className="bg-white shadow-md rounded-lg p-6 text-center">
                <Lightbulb className="text-[#6E59A5] h-10 w-10 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#6E59A5]">Personalized Interventions</h3>
                <p className="mt-2 text-gray-700">
                  Generate custom support strategies tailored to each student`&apos;`s unique needs and challenges.
                </p>
              </div>

              <div className="bg-white shadow-md rounded-lg p-6 text-center">
                <Users className="text-[#6E59A5] h-10 w-10 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#6E59A5]">Engagement Monitoring</h3>
                <p className="mt-2 text-gray-700">
                  Track engagement metrics and academic performance across multiple dimensions in real time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-gradient-to-r from-[#9b87f5] to-[#6E59A5] text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-bold">Ready to make a difference?</h2>
            <p className="mt-4 text-lg">
              Start using Anvesha today and empower your students to succeed!
            </p>
            <div className="mt-6">
              <Link href="/dashboard">
                <Button className="bg-[#E5DEFF]">Go to Dashboard</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t bg-white text-sm text-gray-500 text-center">
        <p>© 2024 Anvesha. All rights reserved.</p>
      </footer>
    </div>
  );
}
