class DatabaseObjectsController < ApplicationController
  def index
    schema = GpdbSchema.find(params[:schema_id])
    account = schema.database.instance.account_for_user! current_user
    GpdbDatabaseObject.refresh(account, schema)

    present schema.database_objects.includes(:schema => {:database => :instance}).
                with_name_like(params[:filter]).
                order("lower(name)").
                paginate(params.slice(:page, :per_page))
  end
end
