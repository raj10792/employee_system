require "rails_helper"

RSpec.describe Salary::DashboardQuery do
  describe "#call" do
    let!(:india) do
      create(
        :country,
        name: "India",
        currency_code: "INR"
      )
    end

    let!(:usa) do
      create(
        :country,
        name: "USA",
        currency_code: "USD"
      )
    end

    let!(:engineering) do
      create(:department, name: "Engineering")
    end

    before do
      create(
        :employee,
        country: india,
        department: engineering,
        job_title: "Ruby Developer",
        salary: 80_000,
        currency: "INR",
        employment_status: :active
      )

      create(
        :employee,
        country: india,
        department: engineering,
        job_title: "Ruby Developer",
        salary: 100_000,
        currency: "INR",
        employment_status: :active
      )

      create(
        :employee,
        country: usa,
        department: engineering,
        job_title: "Software Engineer",
        salary: 5_000,
        currency: "USD",
        employment_status: :active
      )

      create(
        :employee,
        country: india,
        department: engineering,
        job_title: "Ruby Developer",
        salary: 60_000,
        currency: "INR",
        employment_status: :inactive
      )
    end

    it "returns employee summary" do
      result = described_class.new.call

      expect(result[:summary][:total_employees]).to eq(4)
      expect(result[:summary][:active_employees]).to eq(3)
      expect(result[:summary][:inactive_employees]).to eq(1)
    end

    it "returns salary statistics by country and currency" do
      result = described_class.new.call

      india_data = result[:salary_by_country].find do |item|
        item[:country] == "India"
      end

      expect(india_data[:minimum_salary]).to eq(80_000)
      expect(india_data[:maximum_salary]).to eq(100_000)
      expect(india_data[:average_salary]).to eq(90_000)
    end

    it "returns average salary by job title and country" do
      result = described_class.new.call

      ruby_data = result[:salary_by_job_title].find do |item|
        item[:job_title] == "Ruby Developer"
      end

      expect(ruby_data[:average_salary]).to eq(90_000)
    end

    it "does not include inactive employees in salary statistics" do
      result = described_class.new.call

      india_data = result[:salary_by_country].find do |item|
        item[:country] == "India"
      end

      expect(india_data[:employee_count]).to eq(2)
    end
  end
end