class User < ApplicationRecord
  has_secure_password

  enum :role, {
    hr_manager: 0,
    admin: 1,
    employee: 2
  }

  before_validation :normalize_email

  validates :email,
            presence: true,
            uniqueness: { case_sensitive: false },
            format: { with: URI::MailTo::EMAIL_REGEXP }

  private

  def normalize_email
    self.email = email.to_s.strip.downcase
  end
end
