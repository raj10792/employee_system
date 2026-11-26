require 'rails_helper'

RSpec.describe Employee, type: :model do
  describe 'associations' do
    it { should belong_to(:country) }
    it { should belong_to(:department) }
  end

  describe 'validations' do
    subject { build(:employee) } 
    it { should validate_presence_of(:employee_code) }
    it { should validate_uniqueness_of(:employee_code) }

    it { should validate_presence_of(:first_name) }
    it { should validate_presence_of(:last_name) }
    it "requires a full_name when the source names are blank" do
      employee = build(:employee, first_name: nil, last_name: nil, full_name: nil)

      employee.valid?

      expect(employee.errors[:full_name]).to include("can't be blank")
    end

    it { should validate_presence_of(:email) }
    it { should validate_uniqueness_of(:email) }

    it { should validate_presence_of(:job_title) }
    it { should validate_presence_of(:salary) }
    it "should not allow negative salary" do
      employee = build(:employee, salary: -100)

      expect(employee).not_to be_valid
    end

    it "should allow zero salary" do
      employee = build(:employee, salary: 0)

      expect(employee).to be_valid
    end

    it { should validate_presence_of(:currency) }
    it { should validate_presence_of(:employment_status) }
    it { should define_enum_for(:employment_status).with_values(active: 0, inactive: 1, terminated: 2) }

    it { should validate_presence_of(:joining_date) }
  end

  describe "#set_full_name" do
    it "sets full_name from first_name and last_name" do
      employee = build(:employee,
        first_name: "Raj",
        last_name: "kumar"
      )

      employee.valid?

      expect(employee.full_name).to eq("Raj kumar")
    end
  end
end
