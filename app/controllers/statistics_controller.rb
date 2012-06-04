class StatisticsController < GpdbController
  def show
    gpdb_table = GpdbTable.find(params[:table_id])
    account = authorized_gpdb_account(gpdb_table)

    present gpdb_table.stats(account)
  end
end