module Api
  module V1
    class EmployeesController < ApplicationController

      before_action :set_employee, only: [:show, :update, :destroy]

      def index
        employees = Employee.includes(:country, :department).order(created_at: :desc)

        render json: {
          data: employees.as_json(
            include: {
              country: { only: [:id, :name, :iso_code] },
              department: { only: [:id, :name] }
            }
          )
        }, status: :ok
      end

      def show
        render json: employee_response(@employee), status: :ok
      end

      def create
        employee = Employees::CreateService.new(employee_params).call

        if employee.persisted?
          render json: employee_response(employee), status: :created
        else
          render json: {
            errors: employee.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      def update
        employee = Employees::UpdateService.new(@employee, employee_params).call

        if employee.errors.empty?
          render json: employee_response(employee),
                 status: :ok
        else
          render json: {
            errors: employee.errors.full_messages
          }, status: :unprocessable_entity
        end
      end

      def destroy
        Employees::DestroyService.new(@employee).call

        head :no_content
      end

      private

      def set_employee
        @employee = Employee.find(params[:id])
      end

      def employee_params
        params.require(:employee).permit(
          :employee_code,
          :first_name,
          :last_name,
          :email,
          :job_title,
          :salary,
          :currency,
          :employment_status,
          :joining_date,
          :country_id,
          :department_id
        )
      end

      def employee_response(employee)
        employee.as_json(
          include: {
            country: { only: [:id, :name, :iso_code] },
            department: { only: [:id, :name] }
          }
        )
      end

    end
  end
end