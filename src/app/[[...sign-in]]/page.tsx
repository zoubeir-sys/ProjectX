"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const LoginPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const role = user?.publicMetadata.role;
    if (role) {
      router.push(`/${role}`);
    }
  }, [user, router]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 p-4">
      {/* Animated Circles */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              x: [0, 100, 0],
              y: [0, 50, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute rounded-full bg-white/10"
            style={{
              width: `${Math.random() * 200 + 100}px`,
              height: `${Math.random() * 200 + 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20 flex flex-col md:flex-row gap-8"
      >
        {/* Left Panel */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-start">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Image src="/logo1.png" alt="Logo" width={40} height={40} />
              <h1 className="text-3xl font-bold text-white">INSTITUT_TN</h1>
            </div>
            <h2 className="text-white text-2xl font-semibold mb-2">Bienvenue !</h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Plateforme de gestion educative pour les enseignants, etudiants et administrateurs. 
              Gerez les cours, examens, devoirs, presences, messages et bien plus encore via un tableau de bord intuitif.
            </p>
          </motion.div>
        </div>

        {/* Right Panel - Sign In */}
        <div className="w-full md:w-1/2">
          <SignIn.Root>
            <SignIn.Step name="start">
              <div>
                <Clerk.GlobalError className="text-center text-red-400 mb-4" />

                <div className="space-y-5">
                  {/* Username Field */}
                  <Clerk.Field name="identifier">
                    <div className="relative">
                      <Clerk.Input
                        type="text"
                        required
                        className="w-full px-4 py-3 bg-white/5 rounded-lg border border-white/20 focus:ring-2 focus:ring-white/20 outline-none text-white placeholder-white/50"
                        placeholder="Nom d utilisateur"
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-white/50"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    <Clerk.FieldError className="mt-1 text-xs text-red-300" />
                  </Clerk.Field>

                  {/* Password Field */}
                  <Clerk.Field name="password">
                    <div className="relative">
                      <Clerk.Input
                        type="password"
                        required
                        className="w-full px-4 py-3 bg-white/5 rounded-lg border border-white/20 focus:ring-2 focus:ring-white/20 outline-none text-white placeholder-white/50"
                        placeholder="Mot de passe"
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-white/50"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    <Clerk.FieldError className="mt-1 text-xs text-red-300" />
                  </Clerk.Field>

                  {/* Submit Button */}
                  <SignIn.Action
                    submit
                    className={`w-full py-3 px-4 rounded-lg font-medium bg-gradient-to-r from-indigo-500 to-purple-600 hover:brightness-110 text-white flex items-center justify-center gap-2 transition-all duration-300`}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    <motion.span
                      animate={{ x: isHovered ? 3 : 0 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      Se connecter
                    </motion.span>
                    <motion.div
                      animate={{ x: isHovered ? 6 : 0 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </motion.div>
                  </SignIn.Action>
                </div>

                {/* Contact Info */}
                <div className="mt-6 text-center text-white/70 text-sm">
                  <p>
                    Vous n avez pas de compte ?{" "}
                    <a
                      href="#"
                      className="text-blue-300 hover:text-white transition-colors"
                    >
                      Contactez l administrateur
                    </a>
                  </p>
                </div>
              </div>
            </SignIn.Step>
          </SignIn.Root>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
