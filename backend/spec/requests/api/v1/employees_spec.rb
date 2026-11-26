require 'rails_helper'

RSpec.describe "Api::V1::Employees", type: :request do
  let(:country) { create(:country) }
  let(:department) { create(:department) }
  let(:auth_headers) do
    {
      "Authorization" => "Bearer #{Auth::TokenService.encode(create(:user, role: :admin))}"
    }
  end

  let(:valid_attributes) do
    {
      employee_code: "EMP100",
      first_name: "Raj",
      last_name: "Kumar",
      email: "raj@example.com",
      job_title: "Software Engineer",
      salary: 1_200_000,
      currency: "INR",
      joining_date: Date.current,
      country_id: country.id,
      department_id: department.id
    }
  end
  describe "GET /api/v1/employees" do
    
    let!(:india) { create(:country, name: "India", iso_code: "IN") }
    let!(:usa) { create(:country, name: "USA", iso_code: "US", currency_code: "USD") }

    let!(:engineering) { create(:department, name: "Engineering") }
    let!(:hr) { create(:department, name: "HR") }

    let!(:employee1) do
      create(
        :employee,
        first_name: "Raj",
        last_name: "Kumar",
        email: "raj@example.com",
        employee_code: "EMP001",
        country: india,
        department: engineering,
        job_title: "Software Engineer",
        salary: 1_200_000
      )
    end

    let!(:employee2) do
      create(
        :employee,
        first_name: "John",
        last_name: "Smith",
        email: "john@example.com",
        employee_code: "EMP002",
        country: usa,
        department: engineering,
        job_title: "Developer",
        salary: 100_000,
        currency: "USD"
      )
    end

    let!(:employee3) do
      create(
        :employee,
        first_name: "Amit",
        last_name: "Sharma",
        email: "amit@example.com",
        employee_code: "EMP003",
        country: india,
        department: hr,
        job_title: "HR Manager",
        salary: 900_000
      )
    end

    it "returns all employees" do

      get "/api/v1/employees", headers: auth_headers

      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)

      expect(json["data"].length).to eq(3)
    end

    it "returns paginated employees" do
      get "/api/v1/employees",
          params: { page: 1, per_page: 2 },
          headers: auth_headers

      json = JSON.parse(response.body)

      expect(response).to have_http_status(:ok)
      expect(json["data"].size).to eq(2)
      expect(json["meta"]["total_count"]).to eq(3)
    end

    it "uses the first page when page is invalid" do
      get "/api/v1/employees", params: { page: -5 }, headers: auth_headers

      json = JSON.parse(response.body)

      expect(json["meta"]["current_page"]).to eq(1)
    end

    it "searches employees by name" do
      get "/api/v1/employees",
          params: { search: "Raj" },
          headers: auth_headers

      json = JSON.parse(response.body)

      expect(json["data"].size).to eq(1)
      expect(json["data"].first["email"]).to eq("raj@example.com")
    end

    it "searches employees by email" do
      get "/api/v1/employees",
          params: { search: "john@example.com" },
          headers: auth_headers

      json = JSON.parse(response.body)

      expect(json["data"].size).to eq(1)
    end

    it "searches employees by employee code" do
      get "/api/v1/employees",
          params: { search: "EMP003" },
          headers: auth_headers

      json = JSON.parse(response.body)

      expect(json["data"].size).to eq(1)
    end

    it "filters employees by country" do
      get "/api/v1/employees",
          params: { country_id: india.id },
          headers: auth_headers

      json = JSON.parse(response.body)

      expect(json["data"].size).to eq(2)
    end

    it "filters employees by department" do
      get "/api/v1/employees",
          params: { department_id: engineering.id },
          headers: auth_headers

      json = JSON.parse(response.body)

      expect(json["data"].size).to eq(2)
    end

    it "filters employees by job title" do
      get "/api/v1/employees",
          params: { job_title: "Developer" },
          headers: auth_headers

      json = JSON.parse(response.body)

      expect(json["data"].size).to eq(1)
    end

    it "supports combined filters" do
      get "/api/v1/employees",
          params: {
            country_id: india.id,
            department_id: engineering.id
          },
          headers: auth_headers

      json = JSON.parse(response.body)

      expect(json["data"].size).to eq(1)
      expect(json["data"].first["employee_code"]).to eq("EMP001")
    end

    it "sorts employees by salary descending" do
      get "/api/v1/employees",
          params: {
            sort_by: "salary",
            direction: "desc"
          },
          headers: auth_headers

      json = JSON.parse(response.body)

      salaries = json["data"].map { |employee| employee["salary"].to_d }

      expect(salaries).to eq(salaries.sort.reverse)
    end

    it "does not allow invalid sorting columns" do
      get "/api/v1/employees",
          params: {
            sort_by: "invalid_column"
          },
          headers: auth_headers

      expect(response).to have_http_status(:ok)
    end

    it "does not allow more than 100 employees per page" do
      get "/api/v1/employees",
          params: {
            per_page: 500
          },
          headers: auth_headers

      json = JSON.parse(response.body)

      expect(json["data"].size).to be <= 100
    end
    
  end

  it "filters employees by employment status" do
    create(:employee, employment_status: :active)
    create(:employee, employment_status: :inactive)

    get "/api/v1/employees",
        params: { employment_status: "inactive" },
        headers: auth_headers

    json = JSON.parse(response.body)

    expect(json["data"].size).to eq(1)
  end

  describe "GET /api/v1/employees/:id" do
    it "returns employee details" do
      employee = create(:employee)

      get "/api/v1/employees/#{employee.id}", headers: auth_headers

      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)

      expect(json["id"]).to eq(employee.id)
      expect(json["full_name"]).to eq(employee.full_name)
    end

    it "returns 404 for an unknown employee" do
      get "/api/v1/employees/999999", headers: auth_headers

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/employees" do
    it "creates an employee" do
      expect {
        post "/api/v1/employees",
             params: { employee: valid_attributes },
             headers: auth_headers
      }.to change(Employee, :count).by(1)

      expect(response).to have_http_status(:created)

      json = JSON.parse(response.body)

      expect(json["first_name"]).to eq("Raj")
      expect(json["full_name"]).to eq("Raj Kumar")
    end

    it "returns validation errors for invalid data" do
      invalid_attributes = valid_attributes.merge(email: "")

      expect {
        post "/api/v1/employees",
             params: { employee: invalid_attributes },
             headers: auth_headers
      }.not_to change(Employee, :count)

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "PATCH /api/v1/employees/:id" do
    let!(:employee) { create(:employee) }

    it "updates employee information" do
      patch "/api/v1/employees/#{employee.id}",
            params: {
              employee: {
                job_title: "Senior Software Engineer"
              }
            },
            headers: auth_headers

      expect(response).to have_http_status(:ok)

      expect(employee.reload.job_title)
        .to eq("Senior Software Engineer")
    end
  end

  describe "DELETE /api/v1/employees/:id" do
    let!(:employee) { create(:employee) }

    it "deletes an employee" do
      expect {
        delete "/api/v1/employees/#{employee.id}", headers: auth_headers
      }.to change(Employee, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end

  it "rejects unauthenticated requests" do
    get "/api/v1/employees"

    expect(response).to have_http_status(:unauthorized)
  end
end