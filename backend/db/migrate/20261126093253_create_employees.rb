class CreateEmployees < ActiveRecord::Migration[8.1]
  def change
    create_table :employees do |t|
      t.string :employee_code, null: false
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.string :full_name, null: false
      t.string :email, null: false
      t.string :job_title, null: false
      t.decimal :salary, precision: 15, scale: 2, null: false
      t.string :currency, null: false
      t.integer :employment_status, null: false, default: 0
      t.date :joining_date, null: false

      t.references :country, null: false, foreign_key: true
      t.references :department, null: false, foreign_key: true

      t.timestamps
    end

    add_index :employees, :employee_code, unique: true
    add_index :employees, :email, unique: true

    add_index :employees, [:country_id, :job_title]
    add_index :employees, [:country_id, :department_id]
  end
end
