"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Sarathi from "../../../public/Sarathi.png"

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* NAVBAR */}
      <div className="flex justify-between items-center px-8 py-4 bg-white shadow-md sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <img src={Sarathi.src} alt="Saarathi Logo" className="h-10"/>
        </div>
        <Button onClick={() => router.push("/login")}>Login</Button>
      </div>
      {/* HERO SECTION */}
<section className="bg-white py-20">
  <div className="container mx-auto flex flex-col-reverse md:flex-row items-center px-6 md:px-12 lg:px-20">
    
    {/* TEXT */}
    <div className="w-full md:w-1/2 mt-10 md:mt-0">
      <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900 mb-6">
        Revolutionize Your Learning with <span className="text-indigo-600">AI</span>
      </h1>
      <p className="text-lg text-gray-600 mb-6">
        Sarathi tailors your learning journey with adaptive AI—spot weaknesses, boost your strengths, and never fall behind.
      </p>
      <Button
        onClick={() => router.push("/login")}
        className="bg-indigo-600 hover:bg-indigo-700 text-white text-md px-6 py-3 rounded-lg transition duration-300"
      >
        Get Started
      </Button>
    </div>

    {/* IMAGE */}
    <div className="w-full md:w-1/2 flex justify-center p-4">
        <img
            src="https://plus.unsplash.com/premium_vector-1726244129694-a6cd6ceef02a?q=80&w=2012&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="AI Education Illustration"
            className="rounded-xl shadow-xl w-full max-w-md object-contain"
        />
        </div>
  </div>
</section>


      {/* FEATURES */}
      <section className="py-20 px-6 md:px-20 bg-gray-50">
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">Why Sarathi?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              icon: "https://cdn-icons-png.flaticon.com/512/2920/2920297.png",
              title: "AI-Powered Recommendations",
              desc: "Get smart suggestions on what to study next based on your habits and success rates.",
            },
            {
              icon: "https://cdn-icons-png.flaticon.com/512/4149/4149685.png",
              title: "Risk Prediction",
              desc: "Stay on track with predictive insights on potential dropouts and course progress.",
            },
            {
              icon: "https://cdn-icons-png.flaticon.com/512/4280/4280623.png",
              title: "Collaborative Study Rooms",
              desc: "Connect with peers, share notes, and stay accountable in study spaces.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-xl transition"
            >
              <img src={f.icon} alt={f.title} className="w-16 h-16 mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-2 text-indigo-700">{f.title}</h4>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 text-center px-6">
        <h3 className="text-3xl font-bold mb-4">Start Your AI Learning Journey Now</h3>
        <p className="text-lg mb-6 text-white/90">
          Join thousands of learners who are upgrading their education with AI.
        </p>
        <Button
          onClick={() => router.push("/login")}
          className="text-indigo-700 text-lg px-6 py-3 font-semibold"
        >
          Let&apos;s Begin!
        </Button>
      </section>

      {/* FOOTER */}
      <footer className="text-center text-sm text-gray-400 py-6 bg-white border-t">
        © 2025 Sarathi
      </footer>
    </div>
  );
}
