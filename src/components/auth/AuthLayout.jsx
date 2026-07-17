import AuthBanner from "./AuthBanner";

const AuthLayout = ({ children }) => {
  return (
    <section className="min-h-screen bg-slate-100 flex items-stretch">
      <div className="w-full mx-auto flex flex-col lg:flex-row min-h-screen max-w-[1500px]">
        <AuthBanner />
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </section>
  );
};

export default AuthLayout;