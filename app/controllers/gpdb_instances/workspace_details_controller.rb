module GpdbInstances
  class WorkspaceDetailsController < ApplicationController
    def show
      gpdb_instance = GpdbInstance.find(params[:gpdb_instance_id])
      present gpdb_instance, :presenter_options => {:presenter_class => :GpdbInstanceWorkspaceDetailPresenter}
    end
  end
end