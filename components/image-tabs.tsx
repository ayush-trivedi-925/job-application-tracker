"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";

function ImageTabs() {
  const [activeTab, setActiveTab] = useState("organize"); // organize, hired, boards
  return (
    <section className="border-t py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          {/* Tabs */}
          <div className="flex gap-2 justify-center mb-8">
            <Button
              onClick={() => setActiveTab("organize")}
              className={`rounded-lg  px-6 py-3 text-sm font-medium transition-colors ${!["hired", "boards"].includes(activeTab) ? "bg-primary text-white " : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Organizaed Applications
            </Button>
            <Button
              onClick={() => setActiveTab("hired")}
              className={`rounded-lg  px-6 py-3 text-sm font-medium transition-colors ${!["organize", "boards"].includes(activeTab) ? "bg-primary text-white " : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Get Hired
            </Button>
            <Button
              onClick={() => setActiveTab("boards")}
              className={`rounded-lg  px-6 py-3 text-sm font-medium transition-colors ${!["organize", "hired"].includes(activeTab) ? "bg-primary text-white " : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Manage Boards
            </Button>
          </div>
          <div className="relative mx-auto m-w-5xl overflow-hidden rounded-lg border border-gray-200 shadow-xl">
            {!["hired", "boards"].includes(activeTab) && (
              <Image
                src="/hero-images/hero1.png"
                alt="Organize application preview"
                width={1200}
                height={800}
              />
            )}
            {!["organize", "boards"].includes(activeTab) && (
              <Image
                src="/hero-images/hero2.png"
                alt="Get hired preview"
                width={1200}
                height={800}
              />
            )}
            {!["organize", "hired"].includes(activeTab) && (
              <Image
                src="/hero-images/hero3.png"
                alt="Manage boards preview"
                width={1200}
                height={800}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ImageTabs;
