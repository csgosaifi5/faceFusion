import React from "react";
import Image from "next/image";
import Link from "next/link";

const HomePage = () => {
  return (
    <div>
       <main className="container mx-auto px-4 py-16">
        <section className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Craft Your Digital Presence
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto">
            Elevate your brand with cutting-edge web design and development solutions.
          </p>
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full transition-colors text-lg">
            Get Started
          </button>
        </section>

        <section className="grid md:grid-cols-3 gap-10 mb-20">
          {[
            { title: "Responsive Design", icon: "🖥️" },
            { title: "Modern UI/UX", icon: "🎨" },
            { title: "Performance Optimized", icon: "⚡" },
          ].map((feature, index) => (
            <div key={index} className="bg-gray-100 p-8 rounded-lg text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
          ))}
        </section>

        <section className="flex flex-col md:flex-row items-center justify-between bg-gray-100 rounded-xl p-10 mb-20">
          <div className="md:w-1/2 mb-6 md:mb-0">
            <h2 className="text-3xl font-bold mb-4">Our Latest Project</h2>
            <p className="text-gray-400 mb-6">
              Check out our most recent work - a stunning e-commerce platform that's redefining online shopping.
            </p>
            <button className="bg-transparent hover:bg-purple-600 text-purple-400 font-semibold hover:text-white py-2 px-4 border border-purple-400 hover:border-transparent rounded transition-colors">
              View Project
            </button>
          </div>
          <div className="md:w-1/2">
            <Image
              src="/placeholder.svg?height=300&width=400"
              alt="Latest Project Screenshot"
              width={400}
              height={300}
              className="rounded-lg shadow-lg"
            />
          </div>
        </section>

        <section className="text-center mb-20">
          <h2 className="text-3xl font-bold mb-6">What Our Clients Say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { name: "Alex Johnson", role: "CEO, TechStart", quote: "StyleCraft transformed our online presence. Highly recommended!" },
              { name: "Sarah Lee", role: "Marketing Director, GrowFast", quote: "Incredible designs and top-notch development. A game-changer for us." },
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-100 p-6 rounded-lg">
                <p className="italic mb-4">"{testimonial.quote}"</p>
                <p className="font-semibold">{testimonial.name}</p>
                <p className="text-sm text-gray-400">{testimonial.role}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

    </div>
  );
};

export default HomePage;
