import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it } from "vitest";
import Login from "@/pages/auth/Login";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";

describe("Login Render Test Suite", () => {
  it("renders Login page successfully without runtime crashes", () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </LanguageProvider>
      </MemoryRouter>
    );
  });

  it("renders Login page in Tamil when ta-IN is chosen", () => {
    localStorage.setItem("aram_lang", "ta-IN");
    const { getByText, getAllByText } = render(
      <MemoryRouter>
        <LanguageProvider>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </LanguageProvider>
      </MemoryRouter>
    );

    // Assert key Tamil words on Login page
    expect(getAllByText(/உள்நுழைக/i).length).toBeGreaterThan(0);
    expect(getByText(/மின்னஞ்சல் முகவரி/i)).toBeDefined();
    expect(getAllByText(/கடவுச்சொல்/i).length).toBeGreaterThan(0);
    expect(getByText(/கடவுச்சொல்லை மறந்துவிட்டீர்களா\?/i)).toBeDefined();
    expect(getByText(/கணக்கில் உள்நுழைக/i)).toBeDefined();
    expect(getByText(/இலவச குடிமக்கள் கணக்கை உருவாக்க/i)).toBeDefined();
  });

  it("renders Forgot Password page in Tamil when ta-IN is chosen", async () => {
    const ForgotPassword = (await import("@/pages/auth/ForgotPassword")).default;
    localStorage.setItem("aram_lang", "ta-IN");
    const { getByText } = render(
      <MemoryRouter>
        <LanguageProvider>
          <AuthProvider>
            <ForgotPassword />
          </AuthProvider>
        </LanguageProvider>
      </MemoryRouter>
    );

    expect(getByText(/கடவுச்சொல்லை மீட்டமைக்க/i)).toBeDefined();
    expect(getByText(/மின்னஞ்சல் அல்லது மொபைல் எண்/i)).toBeDefined();
    expect(getByText(/சரிபார்ப்பு OTP அனுப்புக/i)).toBeDefined();
  });

  it("renders Register page in Tamil when ta-IN is chosen", async () => {
    const Register = (await import("@/pages/auth/Register")).default;
    localStorage.setItem("aram_lang", "ta-IN");
    const { getByText, getAllByText } = render(
      <MemoryRouter>
        <LanguageProvider>
          <AuthProvider>
            <Register />
          </AuthProvider>
        </LanguageProvider>
      </MemoryRouter>
    );

    expect(getAllByText(/குடிமக்கள் கணக்கை உருவாக்க/i).length).toBeGreaterThan(0);
    expect(getByText(/முழுப் பெயர்/i)).toBeDefined();
    expect(getByText(/மின்னஞ்சல் முகவரி/i)).toBeDefined();
    expect(getByText(/மொபைல் எண்/i)).toBeDefined();
    expect(getByText(/மாவட்டம்/i)).toBeDefined();
    expect(getByText(/இலவச கணக்கை உருவாக்க/i)).toBeDefined();
  });
});
