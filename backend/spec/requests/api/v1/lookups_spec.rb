require "rails_helper"

RSpec.describe "API lookups", type: :request do
  let(:token) { Auth::TokenService.encode(create(:user, role: :hr_manager)) }
  let(:headers) { { "Authorization" => "Bearer #{token}" } }

  it "returns countries and departments for employee forms" do
    country = create(:country, name: "India", iso_code: "IN", currency_code: "INR")
    department = create(:department, name: "Engineering")

    get "/api/v1/lookups", headers: headers

    expect(response).to have_http_status(:ok)
    expect(JSON.parse(response.body).dig("data", "countries")).to include(
      a_hash_including("id" => country.id, "name" => "India", "currency_code" => "INR")
    )
    expect(JSON.parse(response.body).dig("data", "departments")).to include(
      a_hash_including("id" => department.id, "name" => "Engineering")
    )
  end

  it "requires authentication" do
    get "/api/v1/lookups"

    expect(response).to have_http_status(:unauthorized)
  end
end
