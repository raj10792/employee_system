class Employee < ApplicationRecord
  belongs_to :country
  belongs_to :department

  enum :employment_status, {
    active: 0,
    inactive: 1,
    terminated: 2
  }

  validates :employee_code, presence: true, uniqueness: true
  validates :first_name, presence: true
  validates :last_name, presence: true
  validates :full_name, presence: true
  validates :email, presence: true, uniqueness: true, format: {
              with: URI::MailTo::EMAIL_REGEXP
            }
  validates :job_title, presence: true
  validates :salary, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :currency, presence: true
  validates :employment_status, presence: true
  validates :joining_date, presence: true

  before_validation :set_full_name

  private

  def set_full_name
    self.full_name = [first_name, last_name].compact_blank.join(" ")
  end
end
