require "rails_helper"

RSpec.describe Auth::TokenService do
  let(:user) { create(:user) }

  describe ".encode" do
    it "generates a valid JWT token" do
      token = described_class.encode(user)

      expect(token).to be_present
      expect(token.split(".").size).to eq(3)
    end
  end

  describe ".decode" do
    it "returns the user ID from the token" do
      token = described_class.encode(user)

      payload = described_class.decode(token)

      expect(payload["sub"]).to eq(user.id)
    end

    it "rejects an invalid token" do
      expect {
        described_class.decode("invalid-token")
      }.to raise_error(JWT::DecodeError)
    end
  end
end