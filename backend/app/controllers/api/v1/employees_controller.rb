module Api
  module V1
    class EmployeesController < ApplicationController

      before_action :set_employee, only: [:show, :update, :destroy]

      def index
        result = paginated_employees

        render json: {
          data: result[:employees].as_json(
            include: {
              country: { only: [:id, :name, :iso_code] },
              department: { only: [:id, :name] }
            }
          ),
          meta: {
            total_count: result[:total_count],
            current_page: result[:page],
            per_page: result[:per_page],
            total_pages: result[:total_pages]
          }
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

      def paginated_employees
        relation = Employees::SearchService.new(params).call

        limit = params.fetch(:per_page, 20).to_i
        limit = [[limit, 1].max, 100].min

        page = params.fetch(:page, 1).to_i
        page = [page, 1].max

        total_count = relation.count

        employees = relation.includes(:country, :department).limit(limit).offset((page - 1) * limit)

        {
          employees: employees,
          total_count: total_count,
          page: page,
          per_page: limit,
          total_pages: (total_count.to_f / limit).ceil
        }
      end

    end
  end
end