require "rails_helper"

RSpec.describe "Salary Insights API", type: :request do
  let(:user) { create(:user, role: :hr_manager) }
  let(:token) { Auth::TokenService.encode(user) }

  let(:headers) do
    {
      "Authorization" => "Bearer #{token}"
    }
  end

  describe "GET /api/v1/salaries" do
    it "returns salary insights for authenticated HR manager" do
      get "/api/v1/salaries", headers: headers

      expect(response).to have_http_status(:ok)

      json = JSON.parse(response.body)

      expect(json).to have_key("data")
      expect(json["data"]).to have_key("summary")
      expect(json["data"]).to have_key("salary_by_country")
      expect(json["data"]).to have_key("salary_by_job_title")
    end

    it "rejects unauthenticated requests" do
      get "/api/v1/salaries"

      expect(response).to have_http_status(:unauthorized)
    end

    it "rejects users without permission" do
      user.update!(role: :employee)

      get "/api/v1/salaries", headers: headers

      expect(response).to have_http_status(:forbidden)
    end
  end
end
