class Country < ApplicationRecord
  validates :name, presence: true, uniqueness: { case_sensitive: false }
  validates :iso_code, presence: true, uniqueness: true
  validates :currency_code, presence: true

  has_many :employees, dependent: :restrict_with_exception
end
 