module Salary
  class DashboardQuery
    def call
      {
        summary: employee_summary,
        salary_by_country: salary_by_country,
        salary_by_job_title: salary_by_job_title
      }
    end

    private

    def employee_summary
      {
        ttotal_employees: Employee.count,
        active_employees: Employee.active.count,
        inactive_employees: Employee.inactive.count,
        terminated_employees: Employee.terminated.count
      }
    end

    def salary_by_country
      active_employees
        .joins(:country)
        .group("countries.name", "employees.currency")
        .pluck(
          "countries.name",
          "employees.currency",
          Arel.sql("MIN(employees.salary)"),
          Arel.sql("MAX(employees.salary)"),
          Arel.sql("AVG(employees.salary)"),
          Arel.sql("COUNT(employees.id)")
        )
        .map do |country, currency, minimum, maximum, average, count|
          {
            country: country,
            currency: currency,
            minimum_salary: minimum,
            maximum_salary: maximum,
            average_salary: average,
            employee_count: count
          }
        end
    end

    def salary_by_job_title
      active_employees
        .joins(:country)
        .group("employees.job_title", "countries.name")
        .pluck(
          "employees.job_title",
          "countries.name",
          Arel.sql("AVG(employees.salary)"),
          Arel.sql("COUNT(employees.id)")
        )
        .map do |job_title, country, average, count|
          {
            job_title: job_title,
            country: country,
            average_salary: average,
            employee_count: count
          }
        end
    end

    def active_employees
      Employee.active
    end
  end
end
