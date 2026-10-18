"use client";

import {
  RiDiscordLine,
  RiInstagramLine,
  RiWhatsappLine,
} from "@remixicon/react";
import Section from "./Section";

export default function Contact() {
  return (
    <footer
      id="contact"
      className="text-white flex flex-col items-center py-4"
    >
      <div className="px-4 flex flex-col items-center">
        <img src="https://ik.imagekit.io/qci75z79t/BBx%20Home%20Pics/hbx3.png" alt="BBX Icon" className="w-40 h-40" />
        <div className="flex space-x-6 -mt-10 mr-2 mb-2">
          <a
            href="https://www.instagram.com/hydbeatboxcommunity/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white"
          >
            <RiInstagramLine className="w-6 h-6" />
          </a>
          <a
            href="https://chat.whatsapp.com/DPog876RSEyFJOHhgB98Ty?mode=hqrc"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white"
          >
            <RiWhatsappLine className="w-6 h-6" />
          </a>
          <a
            href="https://discord.gg/XPsK8Jknj"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white"
          >
            <RiDiscordLine className="w-6 h-6" />
          </a>
        </div>
      </div>
      <p className="mb-1 text-white/50 text-xs">
        {`© ${new Date().getFullYear()} Hyderabad Beatbox Community. All rights reserved.`}
      </p>
      <div className="text-center text-white/50 text-[11px] mt-1 tracking-wide">
        Website Designed &amp; Developed by{" "}
        <a
          href="https://www.instagram.com/xboy.bx/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-sky-400 font-semibold underline underline-offset-2 transition-colors"
          title="X Boy - Official Web Developer of Hyderabad Beatbox Community"
        >
          X Boy (@xboy.bx)
        </a>
      </div>
    </footer>
  );
}
