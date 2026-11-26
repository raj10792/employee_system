class EmployeePolicy < ApplicationPolicy
  def index?
    user.hr_manager? || user.admin?
  end

  def show?
    index?
  end

  def create?
    index?
  end

  def update?
    index?
  end

  def destroy?
    index?
  end
end