import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it } from "vitest";
import Login from "@/pages/auth/Login";
import { AuthProvider } from "@/context/AuthContext";

describe("Login Render Test Suite", () => {
  it("renders Login page successfully without runtime crashes", () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );
  });
});
