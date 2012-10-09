Chorus::Application.routes.draw do
  resource :sessions, :only => [:create, :destroy, :show]
  resource :config, :only => [:show], :controller => 'configurations'
  resources :activities, :only => [:index, :show], :controller => 'events'

  resources :users, :only => [:index, :show, :create, :update, :destroy] do
    collection do
      get :ldap
    end
    resource :image, :only => [:show, :create], :controller => :user_images
  end

  resources :hadoop_instances, :only => [:create, :index, :show, :update] do
    scope :module => 'hdfs' do
      resources :files, :only => [:show, :index]
    end
  end

  resources :gpdb_instances, :only => [:index, :show, :create, :update] do
    resources :databases, :only => [:index], :controller => 'instance_databases'

    scope :module => 'gpdb_instances' do
      resource :owner, :only => [:update], :controller => 'owner'
      resource :sharing, :only => [:create, :destroy], :controller => 'sharing'
      resource :account, :only => [:show, :create, :update, :destroy], :controller => 'account'
      resource :workspace_detail, :only => [:show]
      resources :members, :only => [:index, :create, :update, :destroy]
    end
  end

  resources :gnip_instances, :only => [:create]

  resources :databases, :only => [:show], :controller => 'instance_databases' do
    resources :schemas, :only => [:index]
  end

  resources :schemas, :only => [:show] do
    resources :datasets, :only => [:index]
    resources :functions, :only => [:index]
  end

  resources :tables, :only => [] do
    resource :analyze, :only => [:create], :controller => 'analyze'
  end

  resources :datasets, :only => [:show] do
    resources :columns, :only => [:index], :controller => 'column'
    resources :previews, :only => [:create, :destroy], :constraints => {:id => /.*/}
    resources :visualizations, :only => [:create, :destroy]
    resource :statistics, :only => :show
    resource :download, :only => :show, :controller => 'dataset_downloads'
    collection do
      post :preview_sql, :controller => 'previews'
    end
  end

  resources :chorus_views, :only => [:create, :update, :destroy]

  resources :workspaces, :only => [:index, :create, :show, :update] do
    resources :members, :only => [:index, :create]
    resource :image, :only => [:create, :show], :controller => :workspace_images
    resources :workfiles, :only => [:create, :index]
    resource :quickstart, :only => [:destroy], :controller => "workspace_quickstart"
    resources :datasets, :only => [:index, :create, :show, :destroy], :controller => "workspace_datasets" do
      resource :import, :only => [:show, :create, :update, :destroy], :controller => "dataset_imports"
      resources :tableau_workbooks, :only => :create
    end
    resource :search, :only => [:show], :controller => 'workspace_search'

    resources :external_tables, :only => [:create]
    resources :csv, :only => [:create], :controller => 'workspace_csv' do
      resources :imports, :only => [:create], :controller => 'workspace_csv_imports'
    end
  end

  resources :workfiles, :only => [:show, :destroy] do
    resource :draft, :only => [:show, :update, :create, :destroy], :controller => :workfile_draft
    resources :versions, :only => [:update, :create, :show, :index], :controller => 'workfile_versions'
    resource :copy, :only => [:create], :controller => 'workfile_copy'
    resource :download, :only => [:show], :controller => 'workfile_download'
    resources :executions, :only => [:create, :destroy], :controller => 'workfile_executions'
  end

  resources :workfile_versions, :only => [] do
    resource :image, :only => [:show], :controller => 'workfile_version_images'
  end

  resources :notes, :only => [:create, :update, :destroy] do
    resources :attachments, :only => [:create, :show], :controller => 'attachments'
  end

  resources :comments, :only => [:create, :show, :destroy]

  resources :notifications, :only => [:index] do
    collection do
      put :read
    end
  end

  resources :attachments, :only => [] do
    resource :download, :only => [:show] , :controller => 'attachment_downloads'
  end

  resource :provisioning, :only => [:show], :controller => 'provisioning'

  resources :insights, :only => [:index] do
    collection do
      get :count
      post :promote
    end
  end

  resource :search, :only => [:show], :controller => 'search' do
    get :type_ahead
    get :workspaces
    member do
      post :reindex
    end
  end

  post 'download_chart', :controller => 'image_downloads'

  match "/" => "root#index"
  match "VERSION" => "configurations#version"

  # TODO: Remove this when it's no longer needed
  match '*not_found' => 'root#not_found'
end
