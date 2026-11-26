require 'rails_helper'

RSpec.describe User, type: :model do
  describe "validations" do
    subject { build(:user) }

    it { should validate_presence_of(:email) }
    it { should validate_uniqueness_of(:email).case_insensitive }
  end

  describe "associations and password" do
    it "has a secure password" do
      user = build(:user, password: "password123")

      expect(user.authenticate("password123")).to eq(user)
      expect(user.authenticate("wrong-password")).to be_falsey
    end
  end

  describe "roles" do
    it "supports HR manager and admin roles" do
      expect(build(:user, role: :hr_manager)).to be_hr_manager
      expect(build(:user, role: :admin)).to be_admin
    end
  end
end
