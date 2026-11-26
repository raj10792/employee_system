require "rails_helper"

RSpec.describe "Database seeds" do
  it "creates an HR manager and an admin idempotently" do
    load Rails.root.join("db/seeds.rb")

    hr_manager = User.find_by!(email: ENV.fetch("HR_MANAGER_SEED_EMAIL", "hr@example.com"))
    admin = User.find_by!(email: ENV.fetch("ADMIN_SEED_EMAIL", "admin@example.com"))

    expect(hr_manager.role).to eq("hr_manager")
    expect(admin.role).to eq("admin")

    hr_manager.update!(password: "updated-password")
    expect { load Rails.root.join("db/seeds.rb") }.not_to change(User, :count)
    expect(hr_manager.reload.authenticate("updated-password")).to be_truthy
  end
end
