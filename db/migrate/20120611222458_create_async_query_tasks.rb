class CreateAsyncQueryTasks < ActiveRecord::Migration
  def change
    create_table :async_query_tasks do |t|
      t.integer :process_id
      t.string :check_id

      t.timestamps
    end
    add_index :async_query_tasks, :check_id
  end
end
