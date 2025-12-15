"use client";

import React from "react";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = "large",
  fullScreen = true,
}: LoadingSpinnerProps) {
  // Small 3D pyramid spinner for inline use
  if (size === "small") {
    return (
      <div className="relative w-12 h-12 block transform-style-preserve-3d -rotate-x-20">
        <div className="relative w-full h-full transform-style-preserve-3d animate-spin-slow">
          <span className="pyramid-side-small pyramid-side1-small" />
          <span className="pyramid-side-small pyramid-side2-small" />
          <span className="pyramid-side-small pyramid-side3-small" />
          <span className="pyramid-side-small pyramid-side4-small" />
          <span className="pyramid-shadow-small" />
        </div>
        <style jsx>{`
          .transform-style-preserve-3d {
            transform-style: preserve-3d;
          }

          .-rotate-x-20 {
            transform: rotateX(-20deg);
          }

          .animate-spin-slow {
            animation: spin 4s linear infinite;
          }

          @keyframes spin {
            100% {
              transform: rotateY(360deg);
            }
          }

          .pyramid-side-small {
            width: 24px;
            height: 24px;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            margin: auto;
            transform-origin: center top;
            clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
          }

          .pyramid-side1-small {
            transform: rotateZ(-30deg) rotateY(90deg);
            background: conic-gradient(#2bdeac, #f028fd, #d8cce6, #2f2585);
          }

          .pyramid-side2-small {
            transform: rotateZ(30deg) rotateY(90deg);
            background: conic-gradient(#2f2585, #d8cce6, #f028fd, #2bdeac);
          }

          .pyramid-side3-small {
            transform: rotateX(30deg);
            background: conic-gradient(#2f2585, #d8cce6, #f028fd, #2bdeac);
          }

          .pyramid-side4-small {
            transform: rotateX(-30deg);
            background: conic-gradient(#2bdeac, #f028fd, #d8cce6, #2f2585);
          }

          .pyramid-shadow-small {
            width: 21px;
            height: 21px;
            background: #8b5ad5;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            margin: auto;
            transform: rotateX(90deg) translateZ(-8px);
            filter: blur(3px);
          }
        `}</style>
      </div>
    );
  }

  // Large 3D pyramid spinner
  const containerClass = fullScreen
    ? "fixed top-0 left-0 w-screen h-screen flex justify-center items-center bg-black/10 z-[9999]"
    : "flex justify-center items-center";

  return (
    <div className={containerClass}>
      <div className="relative w-[300px] h-[300px] block transform-style-preserve-3d -rotate-x-20">
        <div className="relative w-full h-full transform-style-preserve-3d animate-spin-slow">
          <span className="pyramid-side pyramid-side1" />
          <span className="pyramid-side pyramid-side2" />
          <span className="pyramid-side pyramid-side3" />
          <span className="pyramid-side pyramid-side4" />
          <span className="pyramid-shadow" />
        </div>
      </div>
      <style jsx>{`
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }

        .-rotate-x-20 {
          transform: rotateX(-20deg);
        }

        .animate-spin-slow {
          animation: spin 4s linear infinite;
        }

        @keyframes spin {
          100% {
            transform: rotateY(360deg);
          }
        }

        .pyramid-side {
          width: 70px;
          height: 70px;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          margin: auto;
          transform-origin: center top;
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }

        .pyramid-side1 {
          transform: rotateZ(-30deg) rotateY(90deg);
          background: conic-gradient(#2bdeac, #f028fd, #d8cce6, #2f2585);
        }

        .pyramid-side2 {
          transform: rotateZ(30deg) rotateY(90deg);
          background: conic-gradient(#2f2585, #d8cce6, #f028fd, #2bdeac);
        }

        .pyramid-side3 {
          transform: rotateX(30deg);
          background: conic-gradient(#2f2585, #d8cce6, #f028fd, #2bdeac);
        }

        .pyramid-side4 {
          transform: rotateX(-30deg);
          background: conic-gradient(#2bdeac, #f028fd, #d8cce6, #2f2585);
        }

        .pyramid-shadow {
          width: 60px;
          height: 60px;
          background: #8b5ad5;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          margin: auto;
          transform: rotateX(90deg) translateZ(-40px);
          filter: blur(12px);
        }
      `}</style>
    </div>
  );
}

export default LoadingSpinner;
