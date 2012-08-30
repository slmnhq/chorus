class RenameStiReferencesFromInstancesToGpdbInstances < ActiveRecord::Migration
  def up
    execute("UPDATE events SET target1_type = 'GpdbInstance' WHERE target1_type = 'Instance';")
    execute("UPDATE events SET target2_type = 'GpdbInstance' WHERE target2_type = 'Instance';")
  end

  def down
    execute("UPDATE events SET target1_type = 'Instance' WHERE target1_type = 'GpdbInstance';")
    execute("UPDATE events SET target2_type = 'Instance' WHERE target2_type = 'GpdbInstance';")
  end
end
