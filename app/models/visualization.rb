class UnknownVisualizationException
end

module Visualization
  def self.build(dataset, chart_task_params)
    if chart_task_params[:type] == 'frequency'
      Visualization::Frequency.new(dataset, chart_task_params)
    elsif chart_task_params[:type] == 'histogram'
      Visualization::Histogram.new(dataset, chart_task_params)
    elsif chart_task_params[:type] == 'heatmap'
      Visualization::Heatmap.new(dataset, chart_task_params)
    elsif chart_task_params[:type] == 'timeseries'
      Visualization::Timeseries.new(dataset, chart_task_params)
    elsif chart_task_params[:type] == 'boxplot'
      Visualization::Boxplot.new(dataset, chart_task_params)
    else
      raise UnknownVisualizationException, "Unknown visualization: #{chart_task_params[:type]}"
    end
  end
end
