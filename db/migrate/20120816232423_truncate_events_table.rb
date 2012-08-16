class TruncateEventsTable < ActiveRecord::Migration
  def up
    execute "truncate table activities;"
    execute "truncate table events;"
  end

  def down
  end
end
