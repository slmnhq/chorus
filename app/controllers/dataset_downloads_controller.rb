class DatasetDownloadsController < GpdbController
  def show
    dataset = Dataset.find(params[:dataset_id])
    @streamer = DatasetStreamer.new(dataset, current_user, params[:row_limit])
    response.headers["Content-Disposition"] = "attachment; filename=#{dataset.name}.csv"
    response.headers["Cache-Control"] = 'no-cache'
    response.headers["Transfer-Encoding"] = 'chunked'
    begin
      self.response_body = @streamer.enum
    rescue ActiveRecord::RecordNotFound => e
      self.response_body = e.message
    end
  end
end
