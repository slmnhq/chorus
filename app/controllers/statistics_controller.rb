class StatisticsController < GpdbController
  def show
    gpdb_table = GpdbDatabaseObject.find(params[:table_id])
    gpdb_table.add_metadata!(authorized_gpdb_account(gpdb_table))
    present gpdb_table.statistics
  end
end
