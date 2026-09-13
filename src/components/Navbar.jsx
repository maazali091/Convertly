import { Menu, Moon, Sun, X, LogOut, UserRound, ChevronDown, } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Navbar({ isDark, setIsDark, user, onLogout, authLoading }) {
  const [sidebar, setSidebar] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  // THEME
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // CLOSE MOBILE MENU
  const closeSidebar = () => {
    setSidebar(false);
  };

  // LOGOUT
  const handleLogout = async () => {
    setAccountOpen(false);
    setSidebar(false);
    if (onLogout) {
      await onLogout();
    }
  };

  // USER DATA
  const userEmail = user?.email || "";
  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Account";
  const avatarLetter =
    userName?.charAt(0)?.toUpperCase() || "U";
  return (
    <header className="relative z-50 w-full">
      <div className="flex h-20 w-full items-center justify-between bg-slate-100 px-5 font-medium dark:bg-slate-900 md:px-10 lg:px-15 xl:h-26">
        {/* LOGO */}
        <Link to="/" onClick={() => { closeSidebar(); setAccountOpen(false); }}
          className="shrink-0">
          <span className="text-[26px] font-bold tracking-wide text-slate-700 dark:text-slate-100 xl:text-[35px]">
            <span className="mr-1 rounded-md bg-indigo-600 px-2 py-0.5 text-[25px] text-slate-100 xl:px-3 xl:py-2 xl:text-[28px]">
              C</span>onvertly
          </span>
        </Link>
        {/* DESKTOP / MOBILE NAVIGATION */}
        <div className={`absolute left-0 top-20 w-full md:max-w-200 overflow-hidden bg-slate-100 px-5 pb-6 transition-all duration-300 ease-in-out dark:bg-slate-900 md:relative md:left-auto md:top-0 md:flex  md:bg-transparent md:w-auto md:flex-1 md:items-center md:justify-between md:overflow-visible  md:px-0 md:pb-0 md:pl-10 xl:pl-20
            ${sidebar ? "max-h-162.5 opacity-100 shadow-lg" : "max-h-0 opacity-0 md:max-h-full md:opacity-100 md:shadow-none"}`}>
          {/* NAV LINKS */}
          <ul
            className="flex flex-col gap-4 border-t border-slate-300 pt-5 text-slate-700 dark:text-gray-300 md:flex-row md:items-center md:gap-5 md:border-0 md:pt-0 xl:gap-7">
            <li className="text-2xl hover:text-indigo-600 dark:hover:text-white md:text-base xl:text-xl">
              <a href="#tools" onClick={closeSidebar}>
                Tools
              </a>
            </li>
            <li className="text-2xl hover:text-indigo-600 dark:hover:text-white md:text-base xl:text-xl">
              <Link to="/pricing" onClick={closeSidebar}>
                Pricing
              </Link>
            </li>
            <li className="text-2xl hover:text-indigo-600 dark:hover:text-white md:text-base xl:text-xl">
              <a href="#features" onClick={closeSidebar}>
                Features
              </a>
            </li>
            <li className="text-2xl hover:text-indigo-600 dark:hover:text-white md:text-base xl:text-xl">
              <a href="#faq" onClick={closeSidebar}>
                FAQ
              </a>
            </li>
          </ul>
          {/* AUTH SECTION */}
          <div className="mt-6 flex flex-col items-start gap-3 md:mt-0 md:flex-row md:items-center md:gap-3">
            {/* LOGGED OUT */}
            {!authLoading && !user && (
              <>
                <Link to="/log-in" onClick={closeSidebar}
                  className="rounded-lg px-4 py-2 text-slate-900 transition hover:bg-slate-200 dark:text-gray-300 dark:hover:bg-slate-800 xl:text-xl">
                  Log In
                </Link>
                <Link to="/sign-up" onClick={closeSidebar}
                  className="rounded-lg bg-indigo-600 px-5 py-2.5 text-white transition hover:bg-indigo-700 xl:mr-4 xl:text-xl">
                  Sign Up
                </Link>
              </>
            )}
            {/* LOGGED IN */}
            {!authLoading && user && (
              <div className="relative">
                {/* Account button */}
                <button type="button"
                  onClick={() =>
                    setAccountOpen((prev) => !prev)
                  }
                  className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-700 shadow-sm transition hover:border-indigo-400 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">

                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white">
                    {avatarLetter}
                  </span>
                  <span className="max-w-62.5 truncate text-sm font-medium">
                    {userName}
                  </span>

                  <ChevronDown size={16} className={`transition-transform duration-200 ${accountOpen ? "rotate-180" : "rotate-0"}`}/>
                </button>

                {/* Account dropdown */}

                {accountOpen && (
                  <div
                    className="absolute right-0 top-[calc(100%+10px)] z-100 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">
                    <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className=" flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 font-semibold text-white">
                          {avatarLetter}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900 dark:text-white">
                            {userName}
                          </p>
                          <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                            {userEmail}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="px-2 py-2">
                      <div className="mb-1 flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-600 dark:text-slate-300">
                        <span>Plan</span>
                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                          Free
                        </span>
                      </div>
                      <button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30">
                        <LogOut size={17} />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div> 
         </div>

        {/* RIGHT CONTROLS */}
        <div className="ml-4 flex shrink-0 items-center gap-3">
          <button type="button" aria-label="Toggle theme" onClick={() => setIsDark(!isDark)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-400 text-slate-100 transition hover:bg-slate-500 active:scale-95">
            {isDark ? ( <Sun size={18} /> ) : ( <Moon size={18} /> )}
          </button>
          <button type="button" aria-label="Toggle navigation" className="text-slate-900 dark:text-slate-100 md:hidden" onClick={() => setSidebar((prev) => !prev)}>
            {sidebar ? (<X size={30} />) : (<Menu size={30} />)}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar