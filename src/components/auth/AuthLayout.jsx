import AuthBanner from "./AuthBanner";

const AuthLayout = ({ children }) => {
  return (
    <section className="min-h-screen flex items-stretch bg-white">
      <div className="w-full flex flex-col lg:flex-row min-h-screen">
        <AuthBanner />
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16 bg-slate-50/50">
          {children}
        </div>
      </div>
    </section>
  );
};

export default AuthLayout;