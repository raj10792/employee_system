module Employees
  class SearchService

    ALLOWED_SORT_COLUMNS = %w[
      created_at
      updated_at
      salary
      joining_date
      first_name
      last_name
    ].freeze

    ALLOWED_DIRECTIONS = %w[asc desc].freeze

    def initialize(params)
      @params = params
    end

    def call
      employees = Employee.all

      employees = search(employees)
      employees = filter_by_country(employees)
      employees = filter_by_department(employees)
      employees = filter_by_job_title(employees)
      employees = filter_by_status(employees)

      sort(employees)
    end

    private

    def search(employees)
      return employees if @params[:search].blank?

      term = "%#{ActiveRecord::Base.sanitize_sql_like(@params[:search])}%"

      employees.where(
        "first_name ILIKE :term OR
         last_name ILIKE :term OR
         full_name ILIKE :term OR
         email ILIKE :term OR
         employee_code ILIKE :term",
        term: term
      )
    end

    def filter_by_country(employees)
      return employees if @params[:country_id].blank?

      employees.where(country_id: @params[:country_id])
    end

    def filter_by_department(employees)
      return employees if @params[:department_id].blank?

      employees.where(department_id: @params[:department_id])
    end

    def filter_by_job_title(employees)
      return employees if @params[:job_title].blank?

      employees.where(
        "job_title ILIKE ?",
        "%#{ActiveRecord::Base.sanitize_sql_like(@params[:job_title])}%"
      )
    end

    def filter_by_status(employees)
      return employees if @params[:employment_status].blank?

      return employees unless Employee.employment_statuses.key?(
        @params[:employment_status]
      )

      employees.where(
        employment_status: @params[:employment_status]
      )
    end

    def sort(employees)
      column = @params[:sort_by].to_s
      direction = @params[:direction].to_s.downcase

      column = "created_at" unless ALLOWED_SORT_COLUMNS.include?(column)

      direction = "desc" unless ALLOWED_DIRECTIONS.include?(direction)

      employees.order(column => direction, id: :desc)
    end

  end
end