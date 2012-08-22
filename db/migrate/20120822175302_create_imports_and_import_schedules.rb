class CreateImportsAndImportSchedules < ActiveRecord::Migration
  def up
    create_table :import_schedules do |t|
      t.datetime :start_datetime
      t.date :end_date
      t.string :frequency
      t.datetime :next_import_at
      t.datetime :deleted_at
      t.timestamps

      t.integer :sandbox_id
      t.string :to_table
      t.integer :source_dataset
      t.boolean :truncate
      t.boolean :new_table
      t.integer :user_id
    end

    create_table :imports do |t|
      t.integer :import_schedule_id
      t.datetime :finished_at
      t.datetime :created_at

      t.integer :sandbox_id
      t.string :to_table
      t.integer :source_dataset
      t.boolean :truncate
      t.boolean :new_table
      t.integer :user_id
    end

    add_column :datasets, :import_id, :integer
    add_column :datasets, :import_schedule_id, :integer
  end

  def down
    drop_table :import_schedules
    drop_table :imports
    remove_column :datasets, :import_id
    remove_column :datasets, :import_schedule_id
  end
end
