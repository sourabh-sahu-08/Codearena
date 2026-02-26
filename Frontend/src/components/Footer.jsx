import React from "react";

export default function Footer() {
  return (
    <div className="border-t bg-white">
      <div className="container-max py-8 text-sm text-slate-600 flex flex-col sm:flex-row gap-2 justify-between">
        <div>© {new Date().getFullYear()} HackNation. All rights reserved.</div>
        <div className="text-slate-500">Built with MERN + Tailwind</div>
      </div>
    </div>
  );
}