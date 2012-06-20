class DropAsyncQueryTasks < ActiveRecord::Migration
  def change
    drop_table :async_query_tasks
  end
end
