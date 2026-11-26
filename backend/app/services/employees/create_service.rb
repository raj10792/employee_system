module Employees
  class CreateService

    def initialize(attributes)
      @attributes = attributes
    end

    def call
      employee = Employee.new(@attributes)

      employee.save

      employee
    end

  end
end