require 'rails_helper'

RSpec.describe "Api::V1::Employees", type: :request do
  let(:country) { create(:country) }
  let(:department) { create(:department) }

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
    it "returns all employees" do
      create_list(:employee, 3)

      get "/api/v1/employees"

      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)

      expect(json["data"].length).to eq(3)
    end
  end

  describe "GET /api/v1/employees/:id" do
    it "returns employee details" do
      employee = create(:employee)

      get "/api/v1/employees/#{employee.id}"

      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)

      expect(json["id"]).to eq(employee.id)
      expect(json["full_name"]).to eq(employee.full_name)
    end

    it "returns 404 for an unknown employee" do
      get "/api/v1/employees/999999"

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/employees" do
    it "creates an employee" do
      expect {
        post "/api/v1/employees",
             params: { employee: valid_attributes }
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
             params: { employee: invalid_attributes }
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
            }

      expect(response).to have_http_status(:ok)

      expect(employee.reload.job_title)
        .to eq("Senior Software Engineer")
    end
  end

  describe "DELETE /api/v1/employees/:id" do
    let!(:employee) { create(:employee) }

    it "deletes an employee" do
      expect {
        delete "/api/v1/employees/#{employee.id}"
      }.to change(Employee, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end
  end
end