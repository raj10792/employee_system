require 'rails_helper'

RSpec.describe RevokedToken, type: :model do
  describe "validations" do
    subject { build(:revoked_token) }

    it { should validate_presence_of(:jti) }
    it { should validate_uniqueness_of(:jti) }
    it { should validate_presence_of(:exp) }
  end

  it "stores the revoked token identifier and expiration" do
    revoked_token = build(:revoked_token)
    expected_expiration = revoked_token.exp
    revoked_token.save!

    expect(revoked_token.reload.jti).to be_present
    expect(revoked_token.exp).to eq(expected_expiration)
  end
end
