class SalaryPolicy < ApplicationPolicy
  def index?
    user.hr_manager? || user.admin?
  end
end