module Visualization
  def self.build(dataset, chart_task_params)
    if chart_task_params[:type] == 'frequency'
      Visualization::Frequency.new(dataset, chart_task_params)
    else chart_task_params[:type] == 'histogram'
      Visualization::Histogram.new(dataset, chart_task_params)
    end
  end
end