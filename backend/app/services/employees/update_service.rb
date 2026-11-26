module Employees
  class UpdateService

    def initialize(employee, attributes)
      @employee = employee
      @attributes = attributes
    end

    def call
      @employee.update(@attributes)

      @employee
    end

  end
end