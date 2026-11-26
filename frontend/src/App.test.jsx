import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function loginAndSalaryResponses(fetchMock) {
  fetchMock.mockImplementation(async (url) => {
    const path = new URL(url, "http://localhost").pathname;
    if (path.endsWith("/login")) {
      return jsonResponse({ token: "test-token", user: { email: "hr@example.com", role: "hr_manager" } });
    }
    if (path.endsWith("/salaries")) {
      return jsonResponse({ data: { summary: { ttotal_employees: 12, active_employees: 10, inactive_employees: 1, terminated_employees: 1 }, salary_by_country: [], salary_by_job_title: [] } });
    }
    if (path.endsWith("/lookups")) {
      return jsonResponse({ data: { countries: [{ id: 7, name: "India", currency_code: "INR" }], departments: [{ id: 3, name: "Engineering" }] } });
    }
    if (path.endsWith("/employees")) return jsonResponse({ data: [], meta: { total_count: 0, current_page: 1, per_page: 20, total_pages: 0 } });
    throw new Error(`Unexpected API request: ${path}`);
  });
}

async function signIn() {
  fireEvent.change(screen.getByLabelText("Work email"), { target: { value: "hr@example.com" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password" } });
  fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
  await screen.findByText("Good morning");
}

describe("People & Pay app", () => {
  afterEach(cleanup);

  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn();
  });

  it("signs in and loads the employee summary", async () => {
    loginAndSalaryResponses(global.fetch);
    render(<App />);

    await signIn();

    expect(await screen.findByText("12")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/v1/salaries",
      expect.objectContaining({ headers: expect.any(Headers) }),
    );
  });

  it("submits a new employee with the selected lookup IDs", async () => {
    loginAndSalaryResponses(global.fetch);
    render(<App />);
    await signIn();

    fireEvent.click(screen.getByRole("button", { name: /employees/i }));
    await screen.findByText("All employees");
    fireEvent.click(screen.getByRole("button", { name: /add employee/i }));

    const dialog = screen.getByRole("dialog");
    const values = {
      "First name": "Ada",
      "Last name": "Lovelace",
      "Work email": "ada@example.com",
      "Employee ID": "EMP100",
      "Job title": "Engineer",
      "Annual salary": "120000",
      "Currency": "INR",
      "Joining date": "2025-01-15",
    };
    for (const [label, value] of Object.entries(values)) {
      fireEvent.change(within(dialog).getByLabelText(label), { target: { value } });
    }
    fireEvent.change(within(dialog).getByLabelText("Country"), { target: { value: "7" } });
    fireEvent.change(within(dialog).getByLabelText("Department"), { target: { value: "3" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Add employee" }));

    await waitFor(() => {
      const createCall = global.fetch.mock.calls.find(([url, options]) =>
        new URL(url, "http://localhost").pathname.endsWith("/employees") && options.method === "POST",
      );
      expect(createCall).toBeDefined();
      expect(JSON.parse(createCall[1].body)).toMatchObject({
        employee: {
          first_name: "Ada",
          last_name: "Lovelace",
          country_id: 7,
          department_id: 3,
          salary: 120000,
        },
      });
    });
  });
});
