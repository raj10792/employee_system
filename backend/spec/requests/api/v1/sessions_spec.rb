require "rails_helper"

RSpec.describe "API V1 Sessions", type: :request do
  describe "POST /api/v1/login" do
    let!(:user) do
      create(
        :user,
        email: "hr@example.com",
        password: "password123"
      )
    end

    it "logs in with valid credentials" do
      post "/api/v1/login",
           params: {
             email: "hr@example.com",
             password: "password123"
           }

      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)).to include(
        "message" => "Login successful"
      )

      expect(JSON.parse(response.body)["token"]).to be_present
    end

    it "rejects invalid credentials" do
      post "/api/v1/login",
           params: {
             email: "hr@example.com",
             password: "wrong-password"
           }

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "DELETE /api/v1/logout" do
    let(:user) { create(:user) }
    let(:token) { Auth::TokenService.encode(user) }

    it "revokes the current token" do
      delete "/api/v1/logout",
             headers: {
               "Authorization" => "Bearer #{token}"
             }

      expect(response).to have_http_status(:ok)
      expect(RevokedToken.count).to eq(1)
    end
  end
end