class AddSalaryInsightIndexesToEmployees < ActiveRecord::Migration[8.1]
  def change
    add_index :employees, :employment_status
    add_index :employees, [:employment_status, :country_id]
  end
end
