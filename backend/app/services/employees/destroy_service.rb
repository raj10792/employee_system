module Employees
  class DestroyService

    def initialize(employee)
      @employee = employee
    end

    def call
      @employee.destroy
    end

  end
end