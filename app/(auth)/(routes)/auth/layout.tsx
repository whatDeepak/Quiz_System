"use client";

import * as React from "react";

const AuthLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="m-auto bg-slate-50 rounded-md shadow-xl flex lg:w-[70vw] lg:h-[90vh] md:w-[80vw] md:h-[80vh]">
        <div className="hidden md:flex w-2/5 rounded-tl-md rounded-bl-md bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1E90FF] to-[#99badd] flex-col justify-between">
          {/* Content for left div */}
          <div className="m-10 mt-15">
            <h1 className="md:text-2xl lg:text-4xl font-bold text-left text-white">Elevate Your Experience</h1>
            <p className="md:text-sm text-md font-light text-left text-white mt-8">
              Join our quiz app today and challenge yourself with a variety of quizzes designed to test your knowledge and skills.
            </p>
          </div>

          <div className="flex justify-center ml-10">
            {/* Empty div to push the carousel to the bottom */}
          </div>
          <div className="flex justify-center mb-8 text-white">
            &copy; Quizzly
          </div>
        </div>

        <div className="md:hidden w-[80vw]">
          <div className="text-center">
            {children}
          </div>
        </div>

        {/* Render only on large screens */}
        <div className="hidden md:flex w-3/5 rounded-tr-md rounded-br-md items-center justify-center">
          <div className="text-center">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
