module Visualization
  def self.build(params)
    dataset = Dataset.find(params[:dataset_id])

    if params[:type] == 'frequency'
      Visualization::Frequency.new(dataset, params)
    end
  end
end