class DatasetDownloadsController < GpdbController
  def show
    dataset = Dataset.find(params[:dataset_id])
    @streamer = DatasetStreamer.new(dataset, current_user, params[:row_limit])
    response.headers["Content-Disposition"] = "attachment; filename=#{dataset.name}.csv"
    self.response_body = @streamer.enum
  end
end